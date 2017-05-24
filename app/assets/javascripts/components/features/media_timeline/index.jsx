import {connect} from 'react-redux';
import PropTypes from 'prop-types'
import StatusListContainer from '../ui/containers/status_list_container';
import Column from '../ui/components/column';
import {
  refreshTimeline,
  updateTimeline,
  deleteFromTimelines,
  connectTimeline,
  disconnectTimeline
} from '../../actions/timelines';
import {defineMessages, injectIntl, FormattedMessage} from 'react-intl';
import ColumnBackButtonSlim from '../../components/column_back_button_slim';
import createStream from '../../stream';

const messages = defineMessages({
  title: {id: 'column.media', defaultMessage: 'Media timeline'}
});

const mapStateToProps = state => ({
  hasUnread: state.getIn(['timelines', 'media', 'unread']) > 0,
  streamingAPIBaseURL: state.getIn(['meta', 'streaming_api_base_url']),
  accessToken: state.getIn(['meta', 'access_token'])
});

let subscription;

class MediaTimeline extends React.PureComponent {

  componentDidMount () {
    const {dispatch, streamingAPIBaseURL, accessToken} = this.props;

    dispatch(refreshTimeline('media'));

    if (typeof subscription !== 'undefined') {
      return;
    }

    subscription = createStream(streamingAPIBaseURL, accessToken, 'public:local', {

      connected () {
        dispatch(connectTimeline('media'));
      },

      reconnected () {
        dispatch(connectTimeline('media'));
      },

      disconnected () {
        dispatch(disconnectTimeline('media'));
      },

      received (data) {
        switch (data.event) {
        case 'update':

          const status = JSON.parse(data.payload);
          if (0 < status.media_attachments.length) {
            dispatch(updateTimeline('media', status));
          }
          break;
        case 'delete':
          dispatch(deleteFromTimelines(data.payload));
          break;
        }
      }

    });
  }

  render () {
    const {intl, hasUnread} = this.props;

    return (
      <Column icon='globe' active={hasUnread} heading={intl.formatMessage(messages.title)}>
        <ColumnBackButtonSlim />
        <StatusListContainer
          type='media'
          squareMedia
          scrollKey='media_timeline'
          emptyMessage={<FormattedMessage id='empty_column.public'
          defaultMessage='There is nothing here! Write something publicly, or manually follow users from other instances to fill it up'/>}
        />
      </Column>
    );
  }

};

MediaTimeline.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  streamingAPIBaseURL: PropTypes.string.isRequired,
  accessToken: PropTypes.string.isRequired,
  hasUnread: PropTypes.bool
};

export default connect(mapStateToProps)(injectIntl(MediaTimeline));

import Column from '../ui/components/column';
import ColumnLink from '../ui/components/column_link';
import ColumnSubheading from '../ui/components/column_subheading';
import { Link } from 'react-router';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

const messages = defineMessages({
  heading: { id: 'getting_started.heading', defaultMessage: 'Getting started' },
  public_timeline: { id: 'navigation_bar.public_timeline', defaultMessage: 'Federated timeline' },
  navigation_subheading: { id: 'column_subheading.navigation', defaultMessage: 'Navigation'},
  settings_subheading: { id: 'column_subheading.settings', defaultMessage: 'Settings'},
  community_timeline: { id: 'navigation_bar.community_timeline', defaultMessage: 'Local timeline' },
  media_timeline: { id: 'navigation_bar.media_timeline', defaultMessage: 'Media timeline' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  follow_requests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  sign_out: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
  suggested_accounts: { id: 'navigation_bar.suggested_accounts', defaultMessage: 'Active Accounts' },
  favourites: { id: 'navigation_bar.favourites', defaultMessage: 'Favourites' },
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocked users' },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Muted users' },
  help: { id: 'navigation_bar.help', defaultMessage: 'Pawoo Help'},
  info: { id: 'navigation_bar.info', defaultMessage: 'Extended information' }
});

const mapStateToProps = state => ({
  me: state.getIn(['accounts', state.getIn(['meta', 'me'])])
});

const GettingStarted = ({ intl, me }) => {
  let followRequests = '';

  if (me.get('locked')) {
    followRequests = <ColumnLink icon='users' text={intl.formatMessage(messages.follow_requests)} to='/follow_requests' />;
  }

  return (
    <Column icon='asterisk' heading={intl.formatMessage(messages.heading)} hideHeadingOnMobile={true}>
      <div className='getting-started__wrapper'>
        <ColumnSubheading text={intl.formatMessage(messages.navigation_subheading)}/>
        <ColumnLink icon='users' hideOnMobile={true} text={intl.formatMessage(messages.community_timeline)} to='/timelines/public/local' />
        <ColumnLink icon='image' text={intl.formatMessage(messages.media_timeline)} to='/timelines/public/media' />
        <ColumnLink icon='globe' hideOnMobile={true} text={intl.formatMessage(messages.public_timeline)} to='/timelines/public' />
        <ColumnLink icon='star' text={intl.formatMessage(messages.favourites)} to='/favourites' />
        <ColumnLink icon='user' text={intl.formatMessage(messages.suggested_accounts)} to='/suggested_accounts' />
        {followRequests}
        <ColumnLink icon='volume-off' text={intl.formatMessage(messages.mutes)} to='/mutes' />
        <ColumnLink icon='ban' text={intl.formatMessage(messages.blocks)} to='/blocks' />
        <ColumnSubheading text={intl.formatMessage(messages.settings_subheading)}/>
        <ColumnLink icon='book' text={intl.formatMessage(messages.info)} href='/about/more' />
        <ColumnLink icon='cog' text={intl.formatMessage(messages.preferences)} href='/settings/preferences' />
        <ColumnLink icon='question-circle' text={intl.formatMessage(messages.help)} to='/timelines/tag/pawooヘルプ' />
        <ColumnLink icon='sign-out' text={intl.formatMessage(messages.sign_out)} href='/auth/sign_out' method='delete' />
      </div>

      <div className='scrollable optionally-scrollable' style={{ display: 'flex', flexDirection: 'column' }}>
        <div className='static-content getting-started'>
          <p><FormattedMessage id='getting_started.open_source_notice' defaultMessage='Mastodon is open source software. You can contribute or report issues on GitHub at {github}. {apps}.' values={{ github: <a href="https://github.com/pixiv/mastodon/tree/pawoo" target="_blank">pixiv/mastodon (pawoo)</a>, apps: <a href="https://github.com/tootsuite/documentation/blob/master/Using-Mastodon/Apps.md" target="_blank"><FormattedMessage id='getting_started.apps' defaultMessage='Various apps are available' /></a> }} /></p>
        </div>
      </div>
    </Column>
  );
};

GettingStarted.propTypes = {
  intl: PropTypes.object.isRequired,
  me: ImmutablePropTypes.map.isRequired
};

export default connect(mapStateToProps)(injectIntl(GettingStarted));

import PropTypes from 'prop-types';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Avatar from '../../../components/avatar';
import DisplayName from '../../../components/display_name';
import StatusContent from '../../../components/status_content';
import MediaGallery from '../../../components/media_gallery';
import VideoPlayer from '../../../components/video_player';
import AttachmentList from '../../../components/attachment_list';
import { Link } from 'react-router';
import { FormattedDate, FormattedNumber } from 'react-intl';
import CardContainer from '../containers/card_container';

class DetailedStatus extends React.PureComponent {

  constructor (props, context) {
    super(props, context);
    this.handleAccountClick = this.handleAccountClick.bind(this);
  }

  handleAccountClick (e) {
    if (e.button === 0) {
      e.preventDefault();
      this.context.router.push(`/accounts/${this.props.status.getIn(['account', 'id'])}`);
    }

    e.stopPropagation();
  }

  render () {
    const { expandMedia, squareMedia } = this.props;
    const status = this.props.status.get('reblog') ? this.props.status.get('reblog') : this.props.status;

    let media           = '';
    let applicationLink = '';

    let attachments = status.get('media_attachments');
    if (status.getIn(['pixiv_cards'], Immutable.List()).size > 0) {
      attachments = status.get('pixiv_cards').map(card => {
        return Immutable.fromJS({
          id: Math.random().toString(),
          preview_url: card.get('image_url'),
          remote_url: '',
          text_url: card.get('url'),
          type: 'image',
          url: card.get('image_url')
        });
      });
    }

    if (attachments.size > 0) {
      if (attachments.some(item => item.get('type') === 'unknown')) {
        media = <AttachmentList media={attachments} />;
      } else if (attachments.first().get('type') === 'video') {
        media = <VideoPlayer sensitive={status.get('sensitive')} media={attachments.first()} width={300} height={150} onOpenVideo={this.props.onOpenVideo} autoplay />;
      } else {
        media = <MediaGallery sensitive={status.get('sensitive')} media={attachments} height={300} onOpenMedia={this.props.onOpenMedia} autoPlayGif={this.props.autoPlayGif} expandMedia squareMedia />;
      }
    } else if (status.get('spoiler_text').length === 0) {
      media = <CardContainer statusId={status.get('id')} />;
    }

    if (status.get('application')) {
      applicationLink = <span> · <a className='detailed-status__application' href={status.getIn(['application', 'website'])} target='_blank' rel='noopener'>{status.getIn(['application', 'name'])}</a></span>;
    }

    return (
      <div className='detailed-status'>
        <a href={status.getIn(['account', 'url'])} onClick={this.handleAccountClick} className='detailed-status__display-name'>
          <div className='detailed-status__display-avatar'><Avatar src={status.getIn(['account', 'avatar'])} staticSrc={status.getIn(['account', 'avatar_static'])} size={48} /></div>
          <DisplayName account={status.get('account')} />
        </a>

        <StatusContent status={status} />

        {media}

        <div className='detailed-status__meta'>
          <a className='detailed-status__datetime' href={status.get('url')} target='_blank' rel='noopener'>
            <FormattedDate value={new Date(status.get('created_at'))} hour12={false} year='numeric' month='short' day='2-digit' hour='2-digit' minute='2-digit' />
          </a>{applicationLink} · <Link to={`/statuses/${status.get('id')}/reblogs`} className='detailed-status__link'>
            <i className='fa fa-retweet' />
            <span className='detailed-status__reblogs'>
              <FormattedNumber value={status.get('reblogs_count')} />
            </span>
          </Link> · <Link to={`/statuses/${status.get('id')}/favourites`} className='detailed-status__link'>
            <i className='fa fa-star' />
            <span className='detailed-status__favorites'>
              <FormattedNumber value={status.get('favourites_count')} />
            </span>
          </Link>
        </div>
      </div>
    );
  }

}

DetailedStatus.contextTypes = {
  router: PropTypes.object
};

DetailedStatus.propTypes = {
  status: ImmutablePropTypes.map.isRequired,
  onOpenMedia: PropTypes.func.isRequired,
  onOpenVideo: PropTypes.func.isRequired,
  autoPlayGif: PropTypes.bool,
  expandMedia: PropTypes.bool,
  squareMedia: PropTypes.bool
};

export default DetailedStatus;

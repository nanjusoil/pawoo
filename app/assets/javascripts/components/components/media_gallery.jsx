import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import IconButton from './icon_button';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { isIOS } from '../is_mobile';

const messages = defineMessages({
  toggle_visible: { id: 'media_gallery.toggle_visible', defaultMessage: 'Toggle visibility' }
});

const outerStyle = {
  marginTop: '8px',
  overflow: 'hidden',
  width: '100%',
  boxSizing: 'border-box',
  position: 'relative'
};

const spoilerStyle = {
  textAlign: 'center',
  height: '100%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column'
};

const spoilerSpanStyle = {
  display: 'block',
  fontSize: '14px',
};

const spoilerSubSpanStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '500'
};

const spoilerButtonStyle = {
  position: 'absolute',
  top: '4px',
  left: '4px',
  zIndex: '100'
};

const itemStyle = {
  boxSizing: 'border-box',
  position: 'relative',
  float: 'left',
  border: 'none',
  display: 'block'
};

const thumbStyle = {
  display: 'block',
  width: '100%',
  height: '100%',
  textDecoration: 'none',
  backgroundSize: 'cover',
  cursor: 'zoom-in'
};

const gifvThumbStyle = {
  position: 'relative',
  zIndex: '1',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  cursor: 'zoom-in'
};

class Item extends React.PureComponent {
  constructor (props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick (e) {
    const { index, onClick } = this.props;

    if (e.button === 0) {
      e.preventDefault();
      onClick(index);
    }

    e.stopPropagation();
  }

  render () {
    const { attachment, index, size, squareMedia, expandMedia, lineMedia } = this.props;

    let width  = 50;
    let height = 100;
    let top    = 'auto';
    let left   = 'auto';
    let bottom = 'auto';
    let right  = 'auto';

    if (size === 1 || expandMedia) {
      width = 100;
    } else if (lineMedia) {
      width = (100 - (size - 1)) / size;
      left = `${index}%`;
    }

    if (!expandMedia && !lineMedia) {
      if (size === 4 || (size === 3 && index > 0)) {
        height = 50;
      }

      if (size === 2) {
        if (index === 0) {
          right = '2px';
        } else {
          left = '2px';
        }
      } else if (size === 3) {
        if (index === 0) {
          right = '2px';
        } else if (index > 0) {
          left = '2px';
        }

        if (index === 1) {
          bottom = '2px';
        } else if (index > 1) {
          top = '2px';
        }
      } else if (size === 4) {
        if (index === 0 || index === 2) {
          right = '2px';
        }

        if (index === 1 || index === 3) {
          left = '2px';
        }

        if (index < 2) {
          bottom = '2px';
        } else {
          top = '2px';
        }
      }
    }

    let thumbnail = '';

    if (attachment.get('type') === 'image') {
      if (expandMedia) {
        thumbnail = (
          <a
            href={attachment.get('remote_url') || attachment.get('url')}
            onClick={this.handleClick}
            target='_blank'
          >
            <img src={attachment.get('preview_url')} alt='media' style={{ width: '100%' }} />
          </a>
        );
      } else {
        thumbnail = (
          <a
            className='media-gallery__item-thumbnail'
            href={attachment.get('remote_url') || attachment.get('url')}
            onClick={this.handleClick}
            target='_blank'
            style={{ backgroundImage: `url(${attachment.get('preview_url')})`, backgroundRepeat: 'no-repeat', backgroundPosition: `50% ${squareMedia ? '0' : '20%'}` }}
          />
        );
      }
    } else if (attachment.get('type') === 'gifv') {
      const autoPlay = !isIOS() && this.props.autoPlayGif;

      thumbnail = (
        <div className={`media-gallery__gifv ${autoPlay ? 'autoplay' : ''}`}>
          <video
            className='media-gallery__item-gifv-thumbnail'
            role='application'
            src={attachment.get('url')}
            onClick={this.handleClick}
            autoPlay={autoPlay}
            loop={true}
            muted={true}
          />

          <span className='media-gallery__gifv__label'>GIF</span>
        </div>
      );
    }

    return (
      <div className='media-gallery__item' key={attachment.get('id')} style={{ left: left, top: top, right: right, bottom: bottom, width: `${width}%`, height: `${height}%` }}>
        {thumbnail}
      </div>
    );
  }

}

Item.propTypes = {
  attachment: ImmutablePropTypes.map.isRequired,
  index: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  autoPlayGif: PropTypes.bool.isRequired,
  expandMedia: PropTypes.bool.isRequired,
  lineMedia: PropTypes.bool,
  squareMedia: PropTypes.bool.isRequired
};

class MediaGallery extends React.PureComponent {

  constructor (props, context) {
    super(props, context);
    this.state = {
      visible: !props.sensitive
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleOpen (e) {
    this.setState({ visible: !this.state.visible });
  }

  handleClick (index) {
    this.props.onOpenMedia(this.props.media, index);
  }

  render () {
    const { media, intl, sensitive, squareMedia, expandMedia, lineMedia } = this.props;

    let children;

    if (!this.state.visible) {
      let warning;

      if (sensitive) {
        warning = <FormattedMessage id='status.sensitive_warning' defaultMessage='Sensitive content' />;
      } else {
        warning = <FormattedMessage id='status.media_hidden' defaultMessage='Media hidden' />;
      }

      children = (
        <div role='button' tabIndex='0' className='media-spoiler' onClick={this.handleOpen}>
          <span className='media-spoiler__warning'>{warning}</span>
          <span className='media-spoiler__trigger'><FormattedMessage id='status.sensitive_toggle' defaultMessage='Click to view' /></span>
        </div>
      );
    } else {
      const size = media.take(4).size;
      children = media.take(4).map((attachment, i) =>
        <Item key={attachment.get('id')} onClick={this.handleClick} attachment={attachment} autoPlayGif={this.props.autoPlayGif} index={i} size={size} squareMedia={squareMedia} expandMedia={expandMedia} lineMedia={!!lineMedia} />
      );
    }

    return (
      <div className='media-gallery' style={{ height: (expandMedia && this.state.visible) ? 'auto' : `${this.props.height}px` }}>
        <div className='spoiler-button' style={{ display: !this.state.visible ? 'none' : 'block' }}>
          <IconButton title={intl.formatMessage(messages.toggle_visible)} icon={this.state.visible ? 'eye' : 'eye-slash'} overlay onClick={this.handleOpen} />
        </div>

        {children}
      </div>
    );
  }

}

MediaGallery.propTypes = {
  sensitive: PropTypes.bool,
  media: ImmutablePropTypes.list.isRequired,
  height: PropTypes.number.isRequired,
  onOpenMedia: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  autoPlayGif: PropTypes.bool.isRequired,
  expandMedia: PropTypes.bool.isRequired,
  lineMedia: PropTypes.bool,
  squareMedia: PropTypes.bool.isRequired
};

MediaGallery.defaultProps = {
  expandMedia: false,
  lineMedia: false,
  squareMedia: false
};


export default injectIntl(MediaGallery);

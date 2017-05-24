import { connect } from 'react-redux';
import TextIconButton from '../components/text_icon_button';
import PropTypes from 'prop-types';
import { changeComposeSensitivity } from '../../../actions/compose';
import { Motion, spring } from 'react-motion';
import { injectIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  message: { id: 'compose_form.sensitive_message', defaultMessage: 'Please be sure to mark NSFW if the image you are trying to post is erotic content' }
});

const mapStateToProps = state => ({
  visible: state.getIn(['compose', 'media_attachments']).size > 0,
});

class SensitiveGuide extends React.PureComponent {

  render () {
    const { visible, intl } = this.props;

    return (
      <Motion defaultStyle={{ scale: 0.87 }} style={{ scale: spring(visible ? 1 : 0.87, { stiffness: 200, damping: 10 }) }}>
        {({ scale }) =>
          <div style={{ display: visible ? 'block' : 'none', paddingTop: 10, transform: `translateZ(0) scale(${scale})` }}>
            <div style={{ padding: 10, boxShadow: 'inset 0 0 0 1px white', borderRadius: 4 }}>
              {intl.formatMessage(messages.message)}
            </div>
          </div>
        }
      </Motion>
    );
  }

};

SensitiveGuide.propTypes = {
  visible: PropTypes.bool,
  intl: PropTypes.object.isRequired
};

export default connect(mapStateToProps)(injectIntl(SensitiveGuide));

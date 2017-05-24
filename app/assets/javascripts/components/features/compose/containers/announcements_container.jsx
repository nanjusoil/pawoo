import { connect }   from 'react-redux';
import Announcements from '../components/announcements';

const mapStateToProps = (state, props) => {
  return {
    account: state.getIn(['accounts', state.getIn(['meta', 'me'])]),
  };
};

export default connect(mapStateToProps)(Announcements);

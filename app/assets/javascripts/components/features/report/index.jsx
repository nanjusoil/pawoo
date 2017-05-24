import { connect } from 'react-redux';
import { cancelReport, changeReportComment, submitReport } from '../../actions/reports';
import { fetchAccountTimeline } from '../../actions/accounts';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Column from '../ui/components/column';
import Button from '../../components/button';
import { makeGetAccount } from '../../selectors';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import StatusCheckBox from './containers/status_check_box_container';
import Immutable from 'immutable';
import Toggle from 'react-toggle';
import ColumnBackButtonSlim from '../../components/column_back_button_slim';

const messages = defineMessages({
  heading: { id: 'report.heading', defaultMessage: 'New report' },
  placeholder: { id: 'report.placeholder', defaultMessage: 'Additional comments' },
  submit: { id: 'report.submit', defaultMessage: 'Submit' },
  reportTitle: { id: 'report.select.title', defaultMessage: 'Please select the reason for reporting' },
  reportOptions: {
    donotlike: { id: 'report.select.donotlike', defaultMessage: 'I do not like it' },
    incorrectage: { id: 'report.select.incorrectage', defaultMessage: 'Incorrect CW・NSFW setting' },
    spam: { id: 'report.select.spam', defaultMessage: 'Spam' },
    reproduction: { id: 'report.select.reproduction', defaultMessage: 'Unauthorized reproduction' },
    prohibited: { id: 'report.select.prohibited', defaultMessage: 'Prohibited act' },
  }
});

const makeMapStateToProps = () => {
  const getAccount = makeGetAccount();

  const mapStateToProps = state => {
    const accountId = state.getIn(['reports', 'new', 'account_id']);

    return {
      isSubmitting: state.getIn(['reports', 'new', 'isSubmitting']),
      account: getAccount(state, accountId),
      comment: state.getIn(['reports', 'new', 'comment']),
      statusIds: Immutable.OrderedSet(state.getIn(['timelines', 'accounts_timelines', accountId, 'items'])).union(state.getIn(['reports', 'new', 'status_ids']))
    };
  };

  return mapStateToProps;
};

class Report extends React.PureComponent {

  constructor (props, context) {
    super(props, context);
    this.state = { option: false };
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePreSubmit = this.handlePreSubmit.bind(this);
    this.onToggle = this.onToggle.bind(this);
  }

  componentWillMount () {
    if (!this.props.account) {
      this.context.router.replace('/');
    }

    this.options = Immutable.fromJS([
      { id: 'donotlike', value: '好みではない' },
      { id: 'incorrectage', value: 'CW・NSFW設定の不足' },
      { id: 'spam', value: 'スパム・迷惑行為' },
      { id: 'reproduction', value: '無断転載' },
      { id: 'prohibited', value: '禁止行為に該当' }
    ]);
  }

  componentDidMount () {
    if (!this.props.account) {
      return;
    }

    this.props.dispatch(fetchAccountTimeline(this.props.account.get('id')));
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.account !== nextProps.account && nextProps.account) {
      this.props.dispatch(fetchAccountTimeline(nextProps.account.get('id')));
    }
  }

  handleCommentChange (e) {
    this.props.dispatch(changeReportComment(e.target.value));
  }

  handleSubmit () {
    this.props.dispatch(submitReport());
    this.context.router.replace('/');
  }

  handlePreSubmit () {
    this.setState({ option: true });
  }

  onToggle (e) {
    this.props.dispatch(changeReportComment(e.target.getAttribute('name')));
  }

  render () {
    const { account, comment, intl, statusIds, isSubmitting } = this.props;
    const filled = this.options.findIndex(option => option.get('value') === comment) > -1;

    if (!account) {
      return null;
    }

    return (
      <Column heading={intl.formatMessage(messages.heading)} icon='flag'>
        <ColumnBackButtonSlim />

        <div className='report scrollable'>
          <div className='report__target'>
            <FormattedMessage id='report.target' defaultMessage='Reporting' />
            <strong>{account.get('acct')}</strong>
          </div>

          <div className='scrollable report__statuses'>
            <div>
              {statusIds.map(statusId => <StatusCheckBox id={statusId} key={statusId} disabled={isSubmitting} />)}
            </div>
          </div>

          <div className='report__textarea-wrapper' style={{ padding: '10px' }}>
            {this.state.option &&
              <div className='report__select'>
                <div>
                  <div className='report__select__title'>{intl.formatMessage(messages.reportTitle)}</div>
                  {this.options.map(option =>
                    <div key={option.get('id')} style={{ display: 'flex' }}>
                      <div style={{ flex: '1 1 auto', padding: '10px' }}>
                        {intl.formatMessage(messages.reportOptions[option.get('id')])}
                      </div>
                      <div style={{ flex: '0 0 auto', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Toggle name={option.get('value')} checked={this.props.comment === option.get('value')} onChange={this.onToggle} disabled={isSubmitting} />
                      </div>
                    </div>
                  )}
                  <textarea
                    className={`report__textarea ${filled ? 'filled' : ''}`}
                    placeholder={intl.formatMessage(messages.placeholder)}
                    value={filled ? '' : comment}
                    onChange={this.handleCommentChange}
                    disabled={isSubmitting}
                  />

                  <Button disabled={isSubmitting || comment.length === 0} text={intl.formatMessage(messages.submit)} onClick={this.handleSubmit} block />
                </div>
              </div>
            }
            <div className='report__submit'>
              <Button disabled={isSubmitting} text={intl.formatMessage(messages.submit)} onClick={this.handlePreSubmit} block />
            </div>
          </div>
        </div>
      </Column>
    );
  }

}

Report.contextTypes = {
  router: PropTypes.object
};

Report.propTypes = {
  isSubmitting: PropTypes.bool,
  account: ImmutablePropTypes.map,
  statusIds: ImmutablePropTypes.orderedSet.isRequired,
  comment: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
};

export default connect(makeMapStateToProps)(injectIntl(Report));

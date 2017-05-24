import ImmutablePropTypes from 'react-immutable-proptypes';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  title: { id: 'trend_tags.title', defaultMessage: 'Suggested tag' }
});

class TrendTags extends React.PureComponent {

  componentDidMount () {
    this.props.refreshTrendTags();
    this.interval = setInterval(() => {
      this.props.refreshTrendTags();
    }, 1000 * 60 * 20);
  }

  componentWillUnmount () {
    clearInterval(this.interval);
  }

  render () {
    if (this.props.tags.size === 0) {
      return null
    }

    const { intl } = this.props;
    return (
      <div className="trend-tags">
        <div className="trend-tags__header">
          <i className="fa fa-line-chart trend-tags__header__icon" aria-hidden="true" />
          <div className="trend-tags__header__name">
            {intl.formatMessage(messages.title)}
          </div>
        </div>
        <div className="trend-tags__body">
          <ul>
            {this.props.tags.map(tag => (
              <li key={tag.get('name')}>
                <Link className="trend-tags__name" to={`/timelines/tag/${tag.get('name')}`}>
                  #{tag.get('name')}
                </Link>
                <div className={`trend-tags__description ${tag.get('type') === 'suggestion' ? 'suggestion' : ''}`}>{tag.get('description')}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
};

TrendTags.propTypes = {
  tags: ImmutablePropTypes.list.isRequired,
  refreshTrendTags: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired
};

export default injectIntl(TrendTags);

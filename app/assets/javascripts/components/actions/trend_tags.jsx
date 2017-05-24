import axios from 'axios';

export const TREND_TAGS_SUCCESS = 'TREND_TAGS_SUCCESS';

export function refreshTrendTags() {
  return (dispatch, getState) => {
    axios.get('/api/v1/trend_tags?limit=5')
      .then(response => {
        dispatch(refreshTrendTagsSuccess(response.data));
      });
  }
}

export function refreshTrendTagsSuccess(tags) {
  return {
    type: TREND_TAGS_SUCCESS,
    tags
  }
}

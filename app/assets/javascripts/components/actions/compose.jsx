import api from '../api';

import { updateTimeline } from './timelines';

import * as emojione from 'emojione';

export const COMPOSE_CHANGE          = 'COMPOSE_CHANGE';
export const COMPOSE_SUBMIT_REQUEST  = 'COMPOSE_SUBMIT_REQUEST';
export const COMPOSE_SUBMIT_SUCCESS  = 'COMPOSE_SUBMIT_SUCCESS';
export const COMPOSE_SUBMIT_FAIL     = 'COMPOSE_SUBMIT_FAIL';
export const COMPOSE_REPLY           = 'COMPOSE_REPLY';
export const COMPOSE_REPLY_CANCEL    = 'COMPOSE_REPLY_CANCEL';
export const COMPOSE_MENTION         = 'COMPOSE_MENTION';
export const COMPOSE_UPLOAD_REQUEST  = 'COMPOSE_UPLOAD_REQUEST';
export const COMPOSE_UPLOAD_SUCCESS  = 'COMPOSE_UPLOAD_SUCCESS';
export const COMPOSE_UPLOAD_FAIL     = 'COMPOSE_UPLOAD_FAIL';
export const COMPOSE_UPLOAD_PROGRESS = 'COMPOSE_UPLOAD_PROGRESS';
export const COMPOSE_UPLOAD_UNDO     = 'COMPOSE_UPLOAD_UNDO';

export const COMPOSE_SUGGESTIONS_CLEAR = 'COMPOSE_SUGGESTIONS_CLEAR';
export const COMPOSE_SUGGESTIONS_READY = 'COMPOSE_SUGGESTIONS_READY';
export const COMPOSE_SUGGESTION_SELECT = 'COMPOSE_SUGGESTION_SELECT';

export const COMPOSE_HASH_TAG_CLEAR = 'COMPOSE_HASH_TAG_CLEAR';
export const COMPOSE_HASH_TAG_READY = 'COMPOSE_HASH_TAG_READY';
export const COMPOSE_HASH_TAG_SELECT = 'COMPOSE_HASH_TAG_SELECT';

export const COMPOSE_MOUNT   = 'COMPOSE_MOUNT';
export const COMPOSE_UNMOUNT = 'COMPOSE_UNMOUNT';

export const COMPOSE_SENSITIVITY_CHANGE = 'COMPOSE_SENSITIVITY_CHANGE';
export const COMPOSE_SPOILERNESS_CHANGE = 'COMPOSE_SPOILERNESS_CHANGE';
export const COMPOSE_SPOILER_TEXT_CHANGE = 'COMPOSE_SPOILER_TEXT_CHANGE';
export const COMPOSE_VISIBILITY_CHANGE  = 'COMPOSE_VISIBILITY_CHANGE';
export const COMPOSE_LISTABILITY_CHANGE = 'COMPOSE_LISTABILITY_CHANGE';

export const COMPOSE_EMOJI_INSERT = 'COMPOSE_EMOJI_INSERT';

export function changeCompose(text) {
  return {
    type: COMPOSE_CHANGE,
    text: text
  };
};

export function replyCompose(status, router) {
  return (dispatch, getState) => {
    dispatch({
      type: COMPOSE_REPLY,
      status: status
    });

    if (!getState().getIn(['compose', 'mounted'])) {
      router.push('/statuses/new');
    }
  };
};

export function cancelReplyCompose() {
  return {
    type: COMPOSE_REPLY_CANCEL
  };
};

export function mentionCompose(account, router) {
  return (dispatch, getState) => {
    dispatch({
      type: COMPOSE_MENTION,
      account: account
    });

    if (!getState().getIn(['compose', 'mounted'])) {
      router.push('/statuses/new');
    }
  };
};

export function submitCompose() {
  return function (dispatch, getState) {
    const status = emojione.shortnameToUnicode(getState().getIn(['compose', 'text'], ''));
    if (!status || !status.length) {
      return;
    }
    dispatch(submitComposeRequest());
    api(getState).post('/api/v1/statuses', {
      status,
      in_reply_to_id: getState().getIn(['compose', 'in_reply_to'], null),
      media_ids: getState().getIn(['compose', 'media_attachments']).map(item => item.get('id')),
      sensitive: getState().getIn(['compose', 'sensitive']),
      spoiler_text: getState().getIn(['compose', 'spoiler_text'], ''),
      visibility: getState().getIn(['compose', 'privacy'])
    }, {
      headers: {
        'Idempotency-Key': getState().getIn(['compose', 'idempotencyKey'])
      }
    }).then(function (response) {
      dispatch(submitComposeSuccess({ ...response.data }));

      // To make the app more responsive, immediately get the status into the columns
      dispatch(updateTimeline('home', { ...response.data }));

      if (response.data.in_reply_to_id === null && response.data.visibility === 'public') {
        if (getState().getIn(['timelines', 'community', 'loaded'])) {
          dispatch(updateTimeline('community', { ...response.data }));
        }

        if (getState().getIn(['timelines', 'public', 'loaded'])) {
          dispatch(updateTimeline('public', { ...response.data }));
        }
      }

      const statusTags = response.data.tags.map(it => it.name);
      let tags = JSON.parse(localStorage.getItem('hash_tag_history'));
      if (tags === null) {
        tags = statusTags;
      } else {
        tags = tags.filter(it => !statusTags.includes(it));
        tags.unshift(...statusTags);
      }
      const maxSize = 1000;
      tags = tags.slice(0, maxSize);

      const data = JSON.stringify(tags);
      try {
        localStorage.setItem('hash_tag_history', data);
      } catch (e) {
        //ignore
      }
    }).catch(function (error) {
      dispatch(submitComposeFail(error));
    });
  };
};

export function submitComposeRequest() {
  return {
    type: COMPOSE_SUBMIT_REQUEST
  };
};

export function submitComposeSuccess(status) {
  return {
    type: COMPOSE_SUBMIT_SUCCESS,
    status: status
  };
};

export function submitComposeFail(error) {
  return {
    type: COMPOSE_SUBMIT_FAIL,
    error: error
  };
};

const requestedImageCaches = [];
export function requestImageCache(url) {
  return function (dispatch, getState) {
    // pixiv image cache
    if (requestedImageCaches.indexOf(url) === -1) {
      requestedImageCaches.push(url);
      const data = new FormData();
      data.append('url', url);
      api(getState).post('/api/v1/pixiv_twitter_images', data).catch(() => {
        requestedImageCaches.splice(requestedImageCaches.indexOf(url), 1);
      });
    }
  }
}

export function uploadCompose(files) {
  return function (dispatch, getState) {
    if (getState().getIn(['compose', 'media_attachments']).size > 3) {
      return;
    }

    dispatch(uploadComposeRequest());

    let data = new FormData();
    data.append('file', files[0]);

    api(getState).post('/api/v1/media', data, {
      onUploadProgress: function (e) {
        dispatch(uploadComposeProgress(e.loaded, e.total));
      }
    }).then(function (response) {
      dispatch(uploadComposeSuccess(response.data));
    }).catch(function (error) {
      dispatch(uploadComposeFail(error));
    });
  };
};

export function uploadComposeRequest() {
  return {
    type: COMPOSE_UPLOAD_REQUEST,
    skipLoading: true
  };
};

export function uploadComposeProgress(loaded, total) {
  return {
    type: COMPOSE_UPLOAD_PROGRESS,
    loaded: loaded,
    total: total
  };
};

export function uploadComposeSuccess(media) {
  return {
    type: COMPOSE_UPLOAD_SUCCESS,
    media: media,
    skipLoading: true
  };
};

export function uploadComposeFail(error) {
  return {
    type: COMPOSE_UPLOAD_FAIL,
    error: error,
    skipLoading: true
  };
};

export function undoUploadCompose(media_id) {
  return {
    type: COMPOSE_UPLOAD_UNDO,
    media_id: media_id
  };
};

export function clearComposeSuggestions() {
  return {
    type: COMPOSE_SUGGESTIONS_CLEAR
  };
};

export function clearComposeHashTagSuggestions() {
  return {
    type: COMPOSE_HASH_TAG_CLEAR
  };
};

export function fetchComposeSuggestions(token) {
  return (dispatch, getState) => {
    api(getState).get('/api/v1/accounts/search', {
      params: {
        q: token,
        resolve: false,
        limit: 4
      }
    }).then(response => {
      dispatch(readyComposeSuggestions(token, response.data));
    });
  };
};

export function fetchComposeHashTagSuggestions(token) {
  return (dispatch, _) => {
    const tags = JSON.parse(localStorage.getItem('hash_tag_history')) || [];
    const suggestionMaxSize = 4;
    const suggestions = tags.filter(it => it.startsWith(token)).slice(0, suggestionMaxSize);
    dispatch(readyComposeHashTagSuggestions(token, suggestions));
  };
};

export function readyComposeSuggestions(token, accounts) {
  return {
    type: COMPOSE_SUGGESTIONS_READY,
    token,
    accounts
  };
};

export function readyComposeHashTagSuggestions(token, tags) {
  return {
    type: COMPOSE_HASH_TAG_READY,
    token,
    tags
  }
}

export function selectComposeSuggestion(position, token, accountId) {
  return (dispatch, getState) => {
    const completion = getState().getIn(['accounts', accountId, 'acct']);

    dispatch({
      type: COMPOSE_SUGGESTION_SELECT,
      position,
      token,
      completion
    });
  };
};

export function selectComposeHashTagSuggestion(position, token, tag) {
  return {
    type: COMPOSE_HASH_TAG_SELECT,
    position,
    token,
    completion: tag
  }
}

export function mountCompose() {
  return {
    type: COMPOSE_MOUNT
  };
};

export function unmountCompose() {
  return {
    type: COMPOSE_UNMOUNT
  };
};

export function changeComposeSensitivity() {
  return {
    type: COMPOSE_SENSITIVITY_CHANGE,
  };
};

export function changeComposeSpoilerness() {
  return {
    type: COMPOSE_SPOILERNESS_CHANGE
  };
};

export function changeComposeSpoilerText(text) {
  return {
    type: COMPOSE_SPOILER_TEXT_CHANGE,
    text
  };
};

export function changeComposeVisibility(value) {
  return {
    type: COMPOSE_VISIBILITY_CHANGE,
    value
  };
};

export function insertEmojiCompose(position, emoji) {
  return {
    type: COMPOSE_EMOJI_INSERT,
    position,
    emoji
  };
};

module.exports = function(crowi, app) {
  'use strict'

  var debug = require('debug')('crowi:routs:comment')
  var Comment = crowi.model('Comment')
  var User = crowi.model('User')
  var Page = crowi.model('Page')
  var ApiResponse = require('../util/apiResponse')
  var actions = {}
  var api = {}

  actions.api = api

  /**
   * @api {get} /comments.get Get comments of the page of the revision
   * @apiName GetComments
   * @apiGroup Comment
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id Revision Id.
   */
  api.get = function(req, res) {
    var pageId = req.query.page_id
    var revisionId = req.query.revision_id

    if (revisionId) {
      return Comment.getCommentsByRevisionId(revisionId)
        .then(function(comments) {
          res.json(ApiResponse.success({ comments }))
        })
        .catch(function(err) {
          res.json(ApiResponse.error(err))
        })
    }

    return Comment.getCommentsByPageId(pageId)
      .then(function(comments) {
        res.json(ApiResponse.success({ comments }))
      })
      .catch(function(err) {
        res.json(ApiResponse.error(err))
      })
  }

  /**
   * @api {post} /comments.add Post comment for the page
   * @apiName PostComment
   * @apiGroup Comment
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id Revision Id.
   * @apiParam {String} comment Comment body
   * @apiParam {Number} comment_position=-1 Line number of the comment
   */
  api.add = function(req, res) {
    var form = req.form.commentForm

    if (!req.form.isValid) {
      return res.json(ApiResponse.error('Invalid comment.'))
    }

    var pageId = form.page_id
    var revisionId = form.revision_id
    var comment = form.comment
    var position = form.comment_position || -1

    return Comment.create(pageId, req.user._id, revisionId, comment, position)
      .then(function(createdComment) {
        createdComment.creator = req.user
        return res.json(ApiResponse.success({ comment: createdComment }))
      })
      .catch(function(err) {
        return res.json(ApiResponse.error(err))
      })
  }

  return actions
}

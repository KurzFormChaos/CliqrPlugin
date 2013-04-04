// Generated by CoffeeScript 1.5.0
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'models/question'], function(Backbone, Question) {
    /*
    TODO: docs
    */

    var QuestionCollection;
    return QuestionCollection = (function(_super) {

      __extends(QuestionCollection, _super);

      function QuestionCollection() {
        QuestionCollection.__super__.constructor.apply(this, arguments);
      }

      QuestionCollection.prototype.model = Question;

      QuestionCollection.prototype.url = function() {
        return cliqr.config.PLUGIN_URL + "questions/index?cid=" + cliqr.config.CID;
      };

      QuestionCollection.prototype.comparator = function(question) {
        return question.get('startdate');
      };

      QuestionCollection.prototype.groupByDate = function() {
        return this.groupBy(function(model) {
          var start;
          start = model.get("startdate");
          if (start === 0) {
            return null;
          } else {
            return 86400 * Math.floor(start / 86400);
          }
        });
      };

      return QuestionCollection;

    })(Backbone.Collection);
  });

}).call(this);

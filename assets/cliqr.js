(function() {
  var addNewChoice, compileTemplate, nominal,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  cliqr.model.Question = (function(_super) {

    __extends(Question, _super);

    function Question() {
      return Question.__super__.constructor.apply(this, arguments);
    }

    Question.prototype.initialize = function() {
      return console.log("initialized a Question model", arguments);
    };

    Question.prototype.url = function() {
      return cliqr.config.PLUGIN_URL + ("questions/show/" + (this.get('id')) + "?cid=") + cliqr.config.CID;
    };

    return Question;

  })(Backbone.Model);

  nominal = (function(A) {
    return function(index) {
      return String.fromCharCode(A + index % 26);
    };
  })("A".charCodeAt(0));

  /*
  We use Mustache as template engine. This function makes it a lot
  easier to get a pre-compiled Mustache template.
  */


  compileTemplate = _.memoize(function(name) {
    return Mustache.compile($("#cliqr-template-" + name).html());
  });

  cliqr.ui.TemplateView = (function(_super) {

    __extends(TemplateView, _super);

    function TemplateView() {
      return TemplateView.__super__.constructor.apply(this, arguments);
    }

    TemplateView.prototype.template = function() {
      this.template = compileTemplate(this.template_id);
      return this.template.apply(this, arguments);
    };

    return TemplateView;

  })(Backbone.View);

  cliqr.ui.QuestionsIndexView = (function(_super) {

    __extends(QuestionsIndexView, _super);

    function QuestionsIndexView() {
      return QuestionsIndexView.__super__.constructor.apply(this, arguments);
    }

    QuestionsIndexView.prototype.el = '#cliqr-index';

    QuestionsIndexView.prototype.events = {
      "click button.delete": "confirmDelete"
    };

    QuestionsIndexView.prototype.confirmDelete = function(event) {
      if (!window.confirm("Wirklich l\xf6schen?")) {
        return event.preventDefault();
      }
    };

    QuestionsIndexView.prototype.showCreateForm = function(event) {
      var form;
      event.preventDefault();
      form = new cliqr.ui.QuestionForm();
      return this.$('.page').html(form.render().el);
    };

    return QuestionsIndexView;

  })(Backbone.View);

  cliqr.ui.QuestionView = (function(_super) {

    __extends(QuestionView, _super);

    function QuestionView() {
      this.updateAnswers = __bind(this.updateAnswers, this);
      return QuestionView.__super__.constructor.apply(this, arguments);
    }

    QuestionView.prototype.el = '#cliqr-show';

    QuestionView.prototype.events = {
      "click .fullscreen": "showFS",
      "click .appeal.start a": "startQuestion"
    };

    QuestionView.prototype.showFS = function() {
      var container;
      container = this.$("#layout_page")[0];
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
      return false;
    };

    QuestionView.prototype.initialize = function() {
      console.log("initialized a QuestionView", this);
      return this.model.on("change:answers", this.updateAnswers);
    };

    QuestionView.prototype.render = function() {
      this.enhanceChart();
      return this;
    };

    QuestionView.prototype.enhanceChart = function() {
      var answers, data, max, width, widths;
      this.$('.chart').remove();
      width = 300;
      answers = this.$(".results .count");
      data = _.pluck(this.model.get("answers"), "counter");
      max = _.max(data);
      widths = _.map(data, function(d) {
        if (max > 0) {
          return d / max * width;
        } else {
          return 0;
        }
      });
      console.log("enhance charts", data);
      return answers.after(function(index) {
        return $('<span class="chart"></div>').css({
          width: widths[index]
        }).attr({
          "data-count": data[index]
        });
      });
    };

    QuestionView.prototype.updateAnswers = function(model, answers, options) {
      var attrs, e, i, template;
      attrs = {
        answers: (function() {
          var _i, _len, _results;
          _results = [];
          for (i = _i = 0, _len = answers.length; _i < _len; i = ++_i) {
            e = answers[i];
            _results.push(_.extend({}, e, {
              nominal: nominal(i)
            }));
          }
          return _results;
        })()
      };
      console.log(attrs);
      template = compileTemplate("questions-results");
      this.$(".results").replaceWith(template(attrs));
      return this.render();
    };

    QuestionView.prototype.startQuestion = function(event) {
      return this.$(".appeal.start").addClass("busy");
    };

    return QuestionView;

  })(Backbone.View);

  addNewChoice = function(event) {
    var empty_question, new_choice, template;
    new_choice = $(event.target).closest(".choices").find(".choice-new");
    template = compileTemplate('questions-choice');
    empty_question = {
      answer_id: '',
      text: ''
    };
    return $(template(empty_question)).insertBefore(new_choice).find("input").focus();
  };

  cliqr.ui.QuestionForm = (function(_super) {

    __extends(QuestionForm, _super);

    function QuestionForm() {
      return QuestionForm.__super__.constructor.apply(this, arguments);
    }

    QuestionForm.prototype.template_id = 'questions-form';

    QuestionForm.prototype.events = {
      "click .choice-new": "addChoice",
      "click .close": "removeChoice",
      "keydown input.choice": "enhanceChoiceInput",
      "submit form": "submitForm"
    };

    QuestionForm.prototype.render = function() {
      Mustache.compilePartial('choice', $("#cliqr-template-questions-choice").html());
      this.$el.html(this.template(this.model ? this.model.toJSON() : {}));
      this.$("form").validator();
      return this;
    };

    QuestionForm.prototype.addChoice = function(event) {
      return addNewChoice(event);
    };

    QuestionForm.prototype.removeChoice = function(event) {
      var choice_input;
      choice_input = $(event.target).closest(".choice-input");
      if (choice_input.siblings(".choice-input").length) {
        return choice_input.remove();
      } else {
        return choice_input.effect("shake", 50);
      }
    };

    QuestionForm.prototype.enhanceChoiceInput = function(event) {
      var form_inputs, index, inputs, last;
      if (event.which === 13 || event.which === 38 || event.which === 40 || event.which === 9 && !event.shiftKey) {
        inputs = this.$(".choices input");
        last = inputs.length - 1;
        index = inputs.index(event.target);
        if (event.which === 9 && last === index) {
          event.preventDefault();
          addNewChoice(event);
        }
        if (event.which === 13 || event.which === 40) {
          if (last === index) {
            addNewChoice(event);
          } else {
            inputs[index + 1].focus();
          }
          event.preventDefault();
        }
        if (event.which === 38) {
          form_inputs = this.$(".choices input");
          index = Math.max(0, form_inputs.index(event.target) - 1);
          form_inputs.eq(index).focus();
          return event.preventDefault();
        }
      }
    };

    QuestionForm.prototype.submitForm = function(event) {
      var cid, everything, form, url, url_re, _ref;
      event.preventDefault();
      url_re = /^(.*cliqrplugin\/questions).*cid=([a-fA-F0-9]{32})/;
      _ref = document.location.href.match(url_re), everything = _ref[0], url = _ref[1], cid = _ref[2];
      alert(this.model ? "" + url + "/update/" + this.model.id + "?cid=" + cid : "" + url + "/create?cid=" + cid);
      return;
      form = this.$("form");
      if (form.data("validator").checkValidity()) {
        url = form.attr("action");
        return $.post(url, form.serialize()).done(function(msg) {
          var re;
          re = /(?!questions\/)(create|update\/[a-fA-F0-9]{32})/;
          return alert(url.replace(re, "show/" + msg.id));
        }).fail(function() {
          return console.log("fail", arguments);
        });
      }
    };

    return QuestionForm;

  })(cliqr.ui.TemplateView);

}).call(this);

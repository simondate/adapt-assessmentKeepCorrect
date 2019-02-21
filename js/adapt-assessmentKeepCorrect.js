define(["coreJS/adapt"], function(Adapt) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

  var assessmentKeepCorrect = Backbone.Model.extend({

    initialize: function() {
      this.listenTo(Adapt, 'assessments:reset', this.reset);
      this.listenTo(Adapt, 'assessments:complete', this.complete);
      this.listenTo(Adapt, 'pageView:ready', this.pageReload);
    },

    pageReload: function() {
      var context = this;
      if (!this.questions || !this.reset) return;
      this.reset = false;
      _.each(this.questions, function(question, index) {
        if (question._isCorrect) {
          context.setCorrect(question._id);
        }
      });
    },

    setCorrect: function(questionId) {
      var componentModel = Adapt.findById(questionId);
      componentModel.set('_isCorrect', true);
      componentModel.set('_isSubmitted', true);
      componentModel.set('_isInteractionComplete', true);
      var $component = $('.' + questionId);
      $component.find('.component-widget').addClass('disabled complete submitted show-user-answer');
      $component.find('label').addClass('disabled');
      $component.find('button').addClass('disabled');
      $component.find('label.selected').find('.mcq-correct-icon').show();
      $component.find('.select2').addClass('disabled select2-container--disabled');
      if (componentModel.get('_component') === 'mcq') {
        _.each(componentModel.get('_items'), function(item, index) {
          var $itemLabel = $component.find('label').eq(index);
          var $itemInput = $component.find('input').eq(index);
          $itemLabel.addClass('disabled');
          $itemInput.prop('disabled', true);
          if (item._shouldBeSelected) {
            $itemLabel.addClass('selected');
          }
        });
      } else {
        this.answerMatching($component, componentModel);
        $component.find('.matching-item').css('pointer-events','none');
      }

    },

    answerMatching: function($component, componentModel) {
      _.each(componentModel.get('_items'), function(item, itemIndex) {
        var $select = $($component).find('select').eq(itemIndex);
        var $options = $select.find('option');
        var noCorrectOptions = _.where(item._options, {
          '_isCorrect': true
        }).length == 0;

        if (noCorrectOptions) {
          if ($select.prop('selectedIndex') <= 0) {
            $options.eq(_.random(item._options.length - 1) + 1).prop('selected', true);
          }
        } else {
          _.each(item._options, function(option, optionIndex) {
            if (option._isCorrect) {
              $($component).find('.select2-selection__placeholder').eq(itemIndex).text(option.text);
              $options.eq(optionIndex + 1).prop('selected', true);
            }
          });
        }
      });
    },

    reset: function(state, model) {
      if (!this.questions) return;
      this.reset = true;
    },

    complete: function(state, model) {
      if (state.isPass) {
        $('.hideUntilPass').show();
      } else {
        this.questions = state.questions;
        this.assessmentModel = model;
      }
    }
  });


  Adapt.once("app:dataReady", function() {
    if (!Adapt.course.get('_assessmentKeepCorrect') || !Adapt.course.get('_assessmentKeepCorrect')._isEnabled) return;
    new assessmentKeepCorrect();
  });

  return assessmentKeepCorrect;
});

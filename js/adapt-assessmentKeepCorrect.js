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
      if(!this.questions || !this.reset) return;
      this.reset = false;
      _.each(this.questions, function(question, index) {
        if(question._isCorrect) {
          context.setCorrect(question._id);
        }
      });
    },

    setCorrect: function(questionId) {
      var componentModel = Adapt.findById(questionId);
      componentModel.set('_isCorrect', true);
      componentModel.set('_isSubmitted', true);
      componentModel.set('_isInteractionComplete', true);
      $('.' + questionId).find('.component-widget').addClass('disabled complete submitted show-user-answer');
      $('.' + questionId).find('label').addClass('disabled');
      $('.' + questionId).find('button').addClass('disabled');
      $('.' + questionId).find('label.selected').find('.mcq-correct-icon').show();
      $('.' + questionId).find('.select2').addClass('disabled select2-container--disabled');
      _.each(componentModel.get('_items'), function(item, index){
          var $itemLabel = $('.' + questionId).find('label').eq(index);
          var $itemInput = $('.' + questionId).find('input').eq(index);
          $itemLabel.addClass('disabled');
          $itemInput.prop('disabled', true);
          if(item._shouldBeSelected) {
            $itemLabel.addClass('selected');
          }
      });
    },

    reset: function(state, model) {
      if(!this.questions) return;
      this.reset = true;
    },

    complete: function(state, model) {
      if(state.isPass) {
        $('.hideUntilPass').show();
      } else {
        this.questions = state.questions;
        this.assessmentModel = model;
      }
    }
  });


  Adapt.once("app:dataReady", function() {
    if(!Adapt.course.get('_assessmentKeepCorrect') || !Adapt.course.get('_assessmentKeepCorrect')._isEnabled) return;
    new assessmentKeepCorrect();
  });

  return assessmentKeepCorrect;
});

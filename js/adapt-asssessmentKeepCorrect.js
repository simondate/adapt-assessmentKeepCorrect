define(["coreJS/adapt"], function(Adapt) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

  var asssessmentKeepCorrect = Backbone.Model.extend({

    initialize: function() {
      console.log(this);
      this.listenTo(Adapt, 'assessments:reset', this.reset);
      this.listenTo(Adapt, 'assessments:complete', this.complete);
      this.listenTo(Adapt, 'pageView:ready', this.pageReload);
    },

    pageReload: function() {
      console.log('page reload');
      var context = this;
      if(!this.questions || !this.reset) return;
      this.reset = false;
      console.log(this.assessmentModel);
      _.each(this.questions, function(question, index) {
        console.log(index)
        if(question._isCorrect) {
          context.setCorrect(question._id);
        } else {
          console.log('question incorrect')
        }
      });
    },

    setCorrect: function(questionId) {
      var componentModel = Adapt.findById(questionId);
      console.log(questionId);
      componentModel.set('_isCorrect', true);
      componentModel.set('_isSubmitted', true);
      componentModel.set('_isInteractionComplete', true);
      $('.' + questionId).find('.component-widget').addClass('disabled complete submitted show-user-answer');
      $('.' + questionId).find('label').addClass('disabled');
      $('.' + questionId).find('button').addClass('disabled');
      $('.' + questionId).find('select2').addClass('disabled');
      _.each(componentModel.get('_items'), function(item, index){
          var $itemLabel = $('.' + questionId).find('label').eq(index);
          var $itemInput = $('.' + questionId).find('input').eq(index);
          console.log($itemLabel);
          $itemLabel.addClass('disabled');
          $itemInput.prop('disabled', true);
          if(item._shouldBeSelected) {
            $itemLabel.addClass('selected');

            console.log($itemLabel);
          }
      });
    },

    reset: function(state, model) {
      if(!this.questions) return;
      this.reset = true;
    },

    complete: function(state, model) {
      this.questions = state.questions;
      this.assessmentModel = model;
    }
  });


  Adapt.once("app:dataReady", function() {
    //  if(!Adapt.course.get('_menuVideo') || !Adapt.course.get('_menuVideo')._isEnabled) return;
    new asssessmentKeepCorrect();
  });

  return asssessmentKeepCorrect;
});

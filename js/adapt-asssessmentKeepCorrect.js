define(["coreJS/adapt"], function(Adapt) {

  var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');

  var asssessmentKeepCorrect = Backbone.Model.extend({

    className: "extension",



    initialize: function() {
      console.log(this);
      this.listenTo(Adapt, 'assessments:reset', this.reset);
      this.listenTo(Adapt, 'assessments:complete', this.complete);
      this.listenTo(Adapt, 'pageView:ready', this.pageReload);
    },

    pageReload: function() {
      console.log('page reload');
      if(!this.questions || !this.reset) return;
      this.reset = false;
      _.each(this.questions, function(question, index) {
        console.log(index)
        if(question._isCorrect) {
          var componentModel = Adapt.findById(question._id);
          console.log('question correct');
          console.log(question._id);
          console.log(componentModel);
          componentModel.set('_isCorrect', true);
          componentModel.set('_isSubmitted', true);
          $('.' + question._id).addClass('answered-correct');
        } else {
          console.log('question incorrect')
        }
      });
    },

    reset: function(state, model) {
      this.reset = true;
      if(!this.questions) return;
      console.log(this.questions);
      console.log(state);
      console.log(model);
    },

    complete: function(state, model) {
      console.log(state)
      console.log(model)
      this.questions = state.questions;
    }
  });


  Adapt.once("app:dataReady", function() {
    //  if(!Adapt.course.get('_menuVideo') || !Adapt.course.get('_menuVideo')._isEnabled) return;
    new asssessmentKeepCorrect();
  });

  return asssessmentKeepCorrect;
});

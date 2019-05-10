define(["coreJS/adapt"], function(Adapt) {
  Adapt.once("adapt:initialize", function() {
    var article = require('extensions/adapt-contrib-assessment/js/adapt-assessmentArticleModel');
    Adapt.articles.forEach(function(article) {
      if (!article._resetQuestions) return;
      article._resetQuestions = function(callback) {
        var assessmentConfig = this.getConfig();
        var syncIterations = 1; // number of synchronous iterations to perform
        var i = 0,
          qs = this._currentQuestionComponents,
          len = qs.length;

        function step() {
          for (var j = 0, count = Math.min(syncIterations, len - i); j < count; i++, j++) {
            var question = qs[i];
            if (question.get('_isCorrect')) continue;
            question.reset(assessmentConfig._questions._resetType, true);
          }

          i == len ? callback() : setTimeout(step);
        }

        step();
      }
    });
  });
});

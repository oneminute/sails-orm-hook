const includeFiles = require("include-files");
module.exports = function loadModels(sails, cb) {
  includeFiles.optional(
    {
      dirname: sails.config.paths.models,
      filter: /^(.+)\.(?:(?!md|txt).)+$/,
      replaceExpr: /^.*\//,
      flatten: true,
    },
    function (err, models) {
      if (err) {
        console.log(err);
        return cb(err);
      }

      _.each(models, (model, key) => {
        const ModelObjectName = `${model.globalId}Object`;
        global[ModelObjectName] = new Function(
          `return function ${ModelObjectName}(dsName){
            if(dsName && dsName!=='default'){
              this.constructor.prototype.tenantcode = dsName;
              this.constructor.prototype.merchantcode = dsName;
            }
          };`
        )();

        [];
      });

      cb(undefined, models);
      // ---------------------------------------------------------
    }
  );
};

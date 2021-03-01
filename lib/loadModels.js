const includeFiles = require("include-files");
module.exports = async function loadModels(sails, cb) {
  const getModels = () => {
    return new Promise((resolve, reject) => {
      includeFiles.getDictionary(
        {
          dirname: sails.config.paths.models,
          filter: /^(.+)\.(?:(?!md|txt).)+$/,
          replaceExpr: /^.*\//,
          flatten: true,
        },
        function (err, models) {
          if (err) {
            reject(err);
          }

          _.each(models, (model, key) => {
            const ModelObjectName = `${model.globalId}Object`;
            const DbObjectName = `${model.globalId}Dbo`;
            global[ModelObjectName] = new Function(
              `return function ${ModelObjectName}(dsName){
                  if(dsName && dsName!=='default'){
                    this.constructor.prototype.tenantcode = dsName;
                    this.constructor.prototype.merchantcode = dsName;
                  }
                };`
            )();

            if (!global[DbObjectName]) {
              global[DbObjectName] = new Function(
                `return function ${DbObjectName}(){};`
              )();
            }
          });

          resolve(models);

          // ---------------------------------------------------------
        }
      );
    });
  };

  const getDbObjects = () => {
    return new Promise((resolve, reject) => {
      includeFiles.optional(
        {
          dirname: sails.config.paths.models.replace("/models", "/dbobjects"),
          filter: /^(.+)\.(?:(?!md|txt).)+$/,
          replaceExpr: /^.*\//,
          flatten: true,
        },
        function (err, objs) {
          if (err) {
            reject(err);
          }
          resolve();
          // ---------------------------------------------------------
        }
      );
    });
  };

  let models;
  try {
    await getModels().then((mdls) => {
      models = mdls;
    });

    await getDbObjects();
  } catch (error) {
    cb(error);
  }

  cb(undefined, models);
};

export const rollBackSavedDocuments = async (req, res, next) => {
  /**
   * @description delete the saved documents from the database if the request failed
   * @param {object} { model ,_id}  - the saved documents
   */

  console.log("rollbackSavedDocuments middleware");

  if (req.savedDocs) {
    console.log(req.savedDocs);
    const { model, _id } = req.savedDocs;
    await model.findByIdAndDelete(_id);
  }
};

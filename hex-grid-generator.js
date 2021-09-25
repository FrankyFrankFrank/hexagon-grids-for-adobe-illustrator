var doc = app.activeDocument;

var IsSingleItemSelected = function (selection) {
  return selection.length === 1;
};

var IsAHexagonSelected = function (selection) {
  return selection[0].pathPoints.length === 6;
};

var warnUserNothingSelected = function () {
    var text = doc.textFrames.add();
    text.move(doc, ElementPlacement.PLACEATBEGINNING);
    text.contents =
      "Select only one shape.";
    text.left = 40;
    text.top = -100;
    text.textRange.characterAttributes.size = 30;
}

var warnUserNotHexagon = function () {
  var text = doc.textFrames.add();
  text.move(doc, ElementPlacement.PLACEATBEGINNING);
  text.contents =
    "The selected shape is not a hexagon";
  text.left = 40;
  text.top = -100;
  text.textRange.characterAttributes.size = 30;
};

var makeHexGrid = function () {
  if (!IsSingleItemSelected(doc.selection)) {
    warnUserNothingSelected()
    return
  }

  if (!IsAHexagonSelected(doc.selection)) {
    warnUserNotHexagon();
    return;
  }

  // If yes, we'll just assume it's a hexagon.
  var hex = doc.selection[0];
  var hexHeight = hex.height / 2;
  var hexWidth = hex.width / 2;
  var orientation = "horizontal";
  if (hexHeight > hexWidth) {
    orientation = "vertical";
  }

  hex.translate(-hex.left - hexWidth, -hex.top + hexHeight);

  // This is all horrifying magic numbers
  // I am so sorry
  // I blame the terrible environment I had to work in
  var size = hexHeight / 2;
  var rows = doc.height / (size * 1);
  var cols = doc.width / (size * 3);

  var rowStep, colStep;
  if (orientation == "vertical") {
    rowStep = -size * 1.5 * 2;
    colStep = size * 1.73 * 2;
  } else {
    rowStep = -size * 2 * 2;
    colStep = size * 1.73 * 2;
  }
  var offset = 1.73 * -size * 2;

  var tooFarRight = false;
  var tooFatDown = false;
  var previouslyTooFarRight = false;

  for (var colCount = 0; colCount <= cols; colCount++) {
    for (var rowCount = 0; rowCount <= rows; rowCount++) {
      previouslyTooFarRight = false;
      var added = hex.duplicate();
      added.fillColor = hex.fillColor;
      added.strokeColor = hex.strokeColor;
      added.opacity = 75.0;
      added.strokeWidth = 0.5;
      if (orientation == "vertical") {
        added.translate(
          colCount * colStep + (rowCount % 2 == 1 ? colStep * 0.5 : 0),
          rowCount * rowStep
        );
      } else {
        added.translate(
          colCount * colStep,
          rowCount * rowStep + (colCount % 2 == 1 ? rowStep * 0.5 : 0)
        );
      }
      // Let's see if it's off of the artboard
      tooFarRight = Math.abs(added.left) > doc.width;
      tooFarDown = Math.abs(added.top) > doc.height;
      if (tooFarDown) {
        // if it is, remove the hexagon we just added and exit the loop
        added.remove();
        break;
      }
      if (tooFarRight) added.remove();
      if (tooFarRight && previouslyTooFarRight) break;
    }
    // If two in a row are too far right, time to escape
    if (tooFarRight && previouslyTooFarRight) {
      break;
    }
  }
  // Remove the original hexagon
  hex.remove();
};

makeHexGrid();

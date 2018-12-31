///////////////////////////////////////////////////////////////////////////////
// QUnit Testing
// Test: entering their name
QUnit.test("Player has the ability to enter their chosen name and see their score", function(assert){
    assert.ok($("p").length > 1, "The player can enter a name of their choice");
    assert.equal(app.$data.score, 0, "The player has a score to increment");
});

// Test: Making sure their are questions to answers
QUnit.test("There are instructions to be made viewable", function(assert){
  assert.ok($("#instructionsDiv").length > 0, "The Instructions exisits");
  assert.ok($("#viewInstructions").length > 0, "The instruction can be shown and hidden");
});

// Test: Questions are getting generated
QUnit.test("Questions are being generated correctly", function(assert){
  assert.equal(app.$data.question, '', "Questions can be seen");
});

// Test: Display the score and otherPlayers to the player
QUnit.test("Other players and their scores can be seen by the player", function(assert){
  assert.ok($("#otherPlayers").length > 0, "Other Players can been seen by the user");
});

// Test: Function for decoding questions is in motion
QUnit.test("Decoding function in play when gathering questions from DB", function(assert){
  assert.ok(urldecode, "Decoding function used when questions retrieved from open source DB");
});

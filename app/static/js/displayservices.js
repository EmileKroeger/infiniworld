angular.module('infiniworld')
.service("sScrollControl", function() {
  this.left = 0;
  this.top = 0;
  var dragInit = {
    x: 0,
    y: 0,
  }
  moveCallback = null;
  this.dragging = false;
  this.handleMouseDown = function(e) {
    //$scope.offset.left += 10;
    this.dragging = true;
    dragInit.x = e.clientX - this.left;
    dragInit.y = e.clientY - this.top;
  };
  this.handleMouseMove = function(e) {
    if (this.dragging) {
      this.left = e.clientX - dragInit.x;
      this.top = e.clientY - dragInit.y;
      if (moveCallback) {
        moveCallback(this.left, this.top);
      }
    }
  };
  this.handleMouseUp = function(e) {
    this.dragging = false;
  };
  
  this.onMoved = function(callback) {
    // could be an array, but that would cause more problems than it would
    // solve.
    moveCallback = callback;
  }
})

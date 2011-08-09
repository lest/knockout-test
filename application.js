(function ($) {
  ko.bindingHandlers.hasFocus = {
    init: function(element, valueAccessor) {
      $(element).focus(function() {
        var value = valueAccessor();
        value(true);
      });
      $(element).blur(function() {
        var value = valueAccessor();
        value(false);
      });
    },
    update: function(element, valueAccessor) {
      var value = valueAccessor();
      if (ko.utils.unwrapObservable(value)) {
        element.focus();
      } else {
        element.blur();
      }
    }
  };
})(jQuery);

jQuery(function ($) {
  var Todo, viewModel;

  Todo = function (attrs) {
    attrs = attrs || {};
    attrs.done = attrs.done || false;

    this.text = ko.observable(attrs.text);
    this.done = ko.observable(attrs.done);

    this.editMode = ko.observable(false);
  };

  Todo.prototype.destroy = function () {
    viewModel.destroyTodo(this);
  };

  Todo.prototype.edit = function (event) {
    this.editMode(true);
  };

  viewModel = {
    newTodo: ko.observable(''),
    todos: ko.mapping.fromJS([], {
      create: function (options) {
        return new Todo(options.data);
      }
    })
  };

  viewModel.todoCount = ko.dependentObservable(function () {
    return this.todos().length;
  }, viewModel);

  viewModel.doneCount = ko.dependentObservable(function () {
    var count = 0;
    this.todos().forEach(function (todo) {
      if (todo.done()) {
        count++;
      }
    });
    return count;
  }, viewModel);

  viewModel.leftCount = ko.dependentObservable(function () {
    return this.todoCount() - this.doneCount();
  }, viewModel);

  viewModel.createTodo = function () {
    var text = this.newTodo();
    if (text) {
      this.todos.push(new Todo({text: text}));
      this.newTodo('');
    }
  };

  viewModel.destroyTodo = function (todo) {
    this.todos.remove(todo);
  };

  viewModel.destroyDone = function () {
    this.todos.remove(function (todo) {
      return todo.done();
    });
  };

  var storageName = 'todos';
  var data = localStorage.getItem(storageName);
  if (data) {
    ko.mapping.updateFromJSON(viewModel.todos, data);
  }

  ko.dependentObservable(function () {
    var json = ko.mapping.toJSON(viewModel.todos, {ignore: 'editMode'});
    localStorage.setItem(storageName, json);
  }, viewModel);

  ko.applyBindings(viewModel);
});

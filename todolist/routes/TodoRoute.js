var Todo = require('../models/TodoModel');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var TASK_TYPE = {completed: 1, incompleted: 2}; 

module.exports = function(app) {
	
    app.get('/api$', function(req, res) {
        Todo.find(function(err, result) {
			var todos={completed:[], incompleted:[]};
            if (err)
                res.send(err)
			if(result.length){
				result.forEach(function(todo){
					todos[todo.completed ? "completed" : "incompleted"].push(todo);
				});
			}
            res.json(todos); // return all todos in JSON format
        });
    });
	app.get('/api/:taskType', function(req, res) {
		var completed = (TASK_TYPE.completed == req.params.taskType); 
        Todo.find({completed: completed},function(err, todos) {
            if (err)
                res.send(err);			
            res.json(todos); 
        });
    });
  
    app.post('/api$', function(req, res) {
        Todo.create({
            text : req.body.text,
            completed : false
        }, function(err, todo) {
            if (err){
                res.send(err);
			}else{			
				res.json(todo);
            };
        });
    });
	
	app.post('/api/delete/:todoId', function(req, res) {
		var id = ObjectId(req.params.todoId);
        Todo.remove({
            _id : id
        }, function(err, todo) {
            if (err){
				console.log(err);
                res.send(err);
			}else
				//res.json({});
				res.sendStatus(200);
        });		
    });
	
	app.post('/api/complete/:todoId', function(req, res) {
		var id = ObjectId(req.params.todoId);
        Todo.update({_id : id }, {"completed" : true},
			function(err, numberAffected, rawResponse){
				if(err){
					console.log(err);
					res.send(err);
				}
				res.sendStatus(200);
			}
		);		
    });
};
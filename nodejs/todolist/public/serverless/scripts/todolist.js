var TASK_TYPE = {
    completed: 1,
    incompleted: 2
};

var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Overlay = ReactBootstrap.Overlay;


var TodoStoreFactory = function() {

    this.init = function() {
        var incopleted;
        var completed;
        return {
            init: function() {
                incopleted = {
                    0: {
                        id: 0,
                        text: "Delete me (default task)"
                    }
                };
                completed = {};
                return this;
            },
            addAll: function(todoList) {
                $.each(todoList, function(i, task) {
                    incopleted[task.id] = task;
                });
            },
            add: function(task) {
                incopleted[task.id] = task;
            },
            complete: function(taskId) {
                completed[taskId] = incopleted[taskId];
                this.remove(taskId, TASK_TYPE.incompleted);
            },
            remove: function(taskId, completedType) {

                delete(completedType == TASK_TYPE.completed ? completed : incopleted)[taskId];
            },
            getTasks: function(taskType, taskId) {

                var tasks = taskType == TASK_TYPE.completed ? completed : incopleted;
                if (taskId != undefined) {
                    return tasks[taskId];
                } else {
                    return tasks;
                }
            }
        }.init();
    };
};
var NewTaskModal = React.createClass({
	getInitialState: function() {
		this.props.hub.on("CREATE_NEW_TASK", function() {
			this.activate();
		}.bind(this)) ;
        return {           
			newTaskModal: false,
			taskText: ""
        };
    },	
	render: function() {
		return  ( 
			<Modal 	show={this.state.newTaskModal}   onHide={this.close} >
				 <Modal.Header>
					<Modal.Title>New task
						<button type="button" className="close" data-dismiss="modal" onClick={this.close}>
							<span aria-hidden="true">×</span>
							<span className="sr-only">Close</span>
						</button>
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<input type="text" name="task" onChange={this.onChange} size="74" placeholder="Task name..." />
				</Modal.Body>

				<Modal.Footer>
					<Button onClick={this.close}>Close</Button>
					<Button bsStyle="primary" className="pull-right" 
						disabled = {this.state.taskText.trim().length == 0} 
						onClick={this.createNeTask}>Create</Button>					
				</Modal.Footer>			 
			</Modal>
		);
	},
	onChange: function(event) {
        this.setState({
            taskText: event.target.value
        });
    },
    activate: function() {
        this.setState({
            newTaskModal: true,
            taskText: ""
        });
    },
    close: function() {
        this.setState({
            newTaskModal: false
        });
    },
    createNeTask: function() {
        this.props.store.add({
            id: new Date().getTime(),
            text: this.state.taskText
        });
        this.props.hub.trigger("TASK_CREATED");
        this.close();
    }	
});

var TodoList = React.createClass({
	getInitialState: function() {
		this.props.hub.on("TASK_CREATED", function(){
			this.taskCreated();
		}.bind(this));
        return this.getDefaultState();
    },	
	render: function() {
		
		var completedTasks = this.getTasks(TASK_TYPE.completed);
		var inmpletedTasks = this.getTasks(TASK_TYPE.incompleted);
		return (
			<div>
			    <button type="button" className="btn btn-primary pull-right" onClick={this.newTask} > + </button>
				<h2 className="text-center">Simple Todo List</h2>
				<div>	
					<h3>Incompleted tasks</h3>
					{inmpletedTasks}
				</div>
				<div>
					<h3>Completed tasks</h3>
					{completedTasks}
				</div>
				<NewTaskModal hub={this.props.hub} store={this.props.store}/>				
			</div>
		);
	},  
	getTasks : function (taskType) {
		var tasks = this.props.store.getTasks(taskType, undefined);
		var infoBoxStyle={
			position: "absolute",
			top:0,
			right:0
		};
		return (
			<div className="list-group">
				{$.map(tasks, function(task){
					var showActionBox = this.state.activeTaskId === task.id;
					var showFinishButton = taskType == TASK_TYPE.incompleted;
					var achionBoxClasses = showActionBox ? "" : "hide";
					var finisButtonClasses = "btn btn-primary btn-s " + (showFinishButton ? "" : "hide");
					return ( 
					<div key={task.id} className="list-group-item pointer"
					      onMouseOver={this.selectTask.bind(this, task.id)}
						  onMouseLeave={this.unselectTask.bind(this, task.id)}>
						
							<div style={infoBoxStyle} className={achionBoxClasses}>
								<button type="button" className={finisButtonClasses}  onClick={this.finishTask.bind(this, task.id)} >Complete</button>
								&nbsp;<button type="button" className="btn btn-danger btn-s" onClick={this.removeTask.bind(this, task.id, taskType)}>Remove</button>
							</div> 
						
						{task.text}
					</div>) 
				}.bind(this))}
			</div>
		);
	},
	newTask: function () {		
		//this.props.store.add({id: new Date().getTime(), text: "task:"+new Date()});
		this.props.hub.trigger("CREATE_NEW_TASK");
		/*
		this.setState({
			incompleted: this.props.store.getTasks(TASK_TYPE.incompleted),
			newTaskModal: true
		});		
		*/
	},
	taskCreated: function() {
		this.setState({
			incompleted: this.props.store.getTasks(TASK_TYPE.incompleted)
		});	
	},
	selectTask: function(taskId, event) {
		this.setState({activeTaskId : taskId});		
	},
	unselectTask: function(taskId, event) {
		this.setState({activeTaskId : undefined});		
	},
	finishTask: function(taskId, event) {
		
		this.props.store.complete(taskId);
		this.setState(this.getDefaultState());
	},
	removeTask: function(taskId, type) {
		this.unselectTask();
		this.props.store.remove(taskId, type);
		var state={};
		state[TASK_TYPE.incompleted == type ? "incompleted" : "completed"] = this.props.store.getTasks(type);
		this.setState(state);
	},
	getDefaultState : function() {
		this.props.store.getTasks();
		return {			
			completed : this.props.store.getTasks(TASK_TYPE.completed),
			incompleted : this.props.store.getTasks(TASK_TYPE.incompleted),
			activeTaskId : undefined
		};
	} 	
});

window.hub=$({});

ReactDOM.render(
  <TodoList store={(new TodoStoreFactory()).init()} hub={window.hub}/>,
  document.getElementById('todolistContainer')
);


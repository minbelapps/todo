var TASK_TYPE = {completed: 1, incompleted: 2}; 

var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Overlay = ReactBootstrap.Overlay;

var TodoServices = {
	getTasks : function (taskType ,cb){
		return TodoServices._service("get", "api"+(taskType ? "/"+taskType:""), null, cb);
	},
	create : function (data, cb){
		return TodoServices._service("post", "api", data, cb);
	},	
	remove: function(id, cb){
		return TodoServices._service("post", "api/delete/"+id, cb);
	},
	complete: function(id, cb){
		return TodoServices._service("post", "api/complete/"+id, cb);
	},
	_service: function(action,uri, data, cb){
		_start();
		return $[action](uri, data).done(function(result) {
			if(cb)cb(result);
		}).fail(function(err){console.log(err)}).always(_finish());	
	}	
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
			<Modal show={this.state.newTaskModal} onHide={this.close}>
				<Modal.Header>
					<Modal.Title>New task
						<button type="button" className="close" data-dismiss="modal" onClick={this.close}>
							<span aria-hidden="true">×</span>
							<span className="sr-only">Close</span>
						</button>
					</Modal.Title>					
				</Modal.Header>
				<Modal.Body>
					<input type="text" name="task" size="74" onChange={this.onChange} placeholder="Task name..." />
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
		this.setState({ taskText: event.target.value });
	},
	activate:function() {
		this.setState({newTaskModal: true, taskText: ""});
	},
	close: function () {
		this.setState({
			newTaskModal: false
		});	
	},
	createNeTask: function() {
		TodoServices.create({ text: this.state.taskText}, function(rez) {
			this.props.hub.trigger("TASK_CREATED");
			this.close();
		}.bind(this));		
	}	
});

var TodoList = React.createClass({
	getInitialState: function() {
		this.props.hub.on("TASK_CREATED", function() {
			this.taskCreated();
		}.bind(this));
        return this.getDefaultState();
    },
	getDefaultState : function() {
		return {			
			completed : [],
			incompleted : [],
			activeTaskId : undefined
		};
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
					<h3>
						Completed tasks
					</h3>
						{completedTasks}
				</div>
				<NewTaskModal hub={this.props.hub} store={this.props.store}/>
			</div>
		);
	},  
	getTasks : function (taskType) {
		var tasks = this.state[TASK_TYPE.incompleted == taskType ? "incompleted" : "completed"];
		var infoBoxStyle={
			position: "absolute",
			top:0,
			right:0
		};
		return (
			<div className="list-group">
				{$.map(tasks, function(task) {
					var showActionBox = this.state.activeTaskId === task.id;
					var showFinishButton = taskType == TASK_TYPE.incompleted;
					var achionBoxClasses = showActionBox ? "" : "hide";
					var finisButtonClasses = "btn btn-primary btn-s " + (showFinishButton ? "" : "hide");
					return ( 
					<div key={task.id} className="list-group-item pointer"
					      onMouseOver={this.selectTask.bind(this, task.id)}
						  onMouseLeave={this.unselectTask.bind(this, task.id)}>
						
							<div style={infoBoxStyle} className={achionBoxClasses}>
								<button type="button" className={finisButtonClasses}  onClick={this.completeTask.bind(this, task.id)} >Complete</button>
								&nbsp;<button type="button" className="btn btn-danger btn-s" onClick={this.removeTask.bind(this, task.id, taskType)}>Remove</button>
							</div> 
						
						{task.text}
					</div>) 
				}.bind(this))}
			</div>
		);
	},
	newTask: function () {
		this.props.hub.trigger("CREATE_NEW_TASK");
	},
	taskCreated: function () {
		TodoServices.getTasks(TASK_TYPE.incompleted ,function(result) {
			this.setState({	incompleted: result});
		}.bind(this));		
	},
	selectTask: function(taskId, event) {
		this.setState({activeTaskId : taskId});		
	},
	unselectTask: function(taskId, event){
		this.setState({activeTaskId : undefined});		
	},
	completeTask: function(taskId, event) {		
		TodoServices.complete(taskId).done(function() {
			TodoServices.getTasks(false, function(result) {
				this.setState({
					incompleted: result["incompleted"],
					completed: result["completed"]
				});	
			}.bind(this));
		}.bind(this));		
	},
	removeTask: function(taskId, type) {
		this.unselectTask();
		TodoServices.remove(taskId).done(function() {
			TodoServices.getTasks(type).done(function(result) {
				var state={};
				state[TASK_TYPE.incompleted == type ? "incompleted" : "completed"]=result;
				this.setState(state);
			}.bind(this))
			
		}.bind(this));
	},	
	componentDidMount: function() {
        TodoServices.getTasks(false, function(result) {
			this.setState({
				incompleted: result["incompleted"],
				completed: result["completed"]
			});	
		}.bind(this));
    }	
});


ReactDOM.render(
  <TodoList hub={$({})}/>,
  document.getElementById('todolistContainer')
);


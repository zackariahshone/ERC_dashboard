import { createSlice, current } from '@reduxjs/toolkit'

export const employeeListSlice = createSlice({
  name: 'employeelist',
  initialState: {
    employees: [
      {
        name: 'Bob',
        dateStarted: '10/10/24',
        status: "out",
        buildingName: "house1",
        history:[],
        type:'Contractors',
        id:'1'
      },
      {
        name: 'Sally',
        dateStarted: '10/10/24',
        status: "out",
        buildingName: "house2",
        history:[],
        type:'Contractors',
        id:'2'
      },
      {
        name: 'Jeff',
        dateStarted: '10/10/24',
        status: "out",
        buildingName: "house1",
        history:[],
        type:'clients',
        id:'3'
      },
      {
        name: 'Theo',
        dateStarted: '10/10/24',
        status: "out",
        buildingName: "house2",
        history:[],
        type:'clients',
        id:'4'
      },
    ]
  },
  reducers: {
    addEmployee: (state,action) => {
      return {
        ...state,
        employees: [
          ...state.employees,
          action.payload,
        ]
      }
    },
    timeClock: (state,action) => {
      switch(action.payload.employee.status){
        case 'out':
          let outstamp = new Date().getTime();
          console.log('save clockin data clock in: ' ,new Date().getTime())
          state.employees.forEach(employee => {
            if(employee.name == action.payload.employee.name){
              
               employee.status = 'in';
               employee.timeIn = action.payload.time
               employee.timeOut = '';
               employee.history.push(
               { [new Date().toDateString()]:{"in":outstamp}}
              )
               
            }
          });
          outstamp = null
          break
        case 'in':
          console.log('save clockin data clock out: ' ,new Date().getTime())

          let instamp = new Date().getTime() 
          state.employees.forEach(employee => {
            if(employee.name == action.payload.employee.name){
              employee.status = 'out' 
              employee.timeOut = action.payload.time 
              const lastTimeHistory = employee.history.length - 1
              employee.history[lastTimeHistory][new Date().toDateString()].out = instamp;
            } 
          } 
        )
        instamp = null;
          break
        default:
          break
      }
      // return {
      //   ...state,
      //   employees: [
      //     ...state.employees,
      //     action.payload,
      //   ]
      // }
      
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { addEmployee, timeClock, incrementByAmount } = employeeListSlice.actions
export const contractors =  (state) => state.employeeList.employees.filter(emp=>emp.type.toLowerCase() == 'contractors');
export const clients = (state)=> state.employeeList.employees.filter(emp=>emp.type == 'clients');
export default employeeListSlice.reducer
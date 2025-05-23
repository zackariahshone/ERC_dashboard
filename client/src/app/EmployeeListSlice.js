import { createSlice, current } from '@reduxjs/toolkit'

export const employeeListSlice = createSlice({
  name: 'employeelist',
  initialState: {
    employees: [
    ]
  },
  reducers: {
    addEmployeeBulk: (state, action) => {
      
      return {
        ...state,
        employees: [
          ...state.employees,
          ...action.payload.data,
        ]
      }
    },
    addEmployee: (state, action) => {
      return {
        ...state,
        employees: [
          ...state.employees,
          action.payload.data,
        ]
      }
    },
    removeEmployee: (state, action) => {
      const currentState = current(state).employees.filter((employee) => employee.id !== action.payload.data.id)
      return {
        ...state,
        employees: [
          ...currentState,
        ]
      }
    },
    timeClock: (state, action) => {
      let student = state.employees.find(student => student.id === action.payload.student.id);
      if(action.payload.status == "Absent"){
        student.programs[action.payload.program] = 'Absent';
      }else{
        switch (student.programs[action.payload.program]) {
          case 'out':
          case 'Absent':
            student.programs[action.payload.program] = 'in';
          break
        case 'in':
          student.programs[action.payload.program] = 'out'
          break;
        default:
          break
        }
      }
    },
    shiftStudentStatus:(state,action)=>{
      console.log(action);
      let student = action.payload.data.student
      let studentEdit = state.employees.find(student => student.id === action.payload.data.student.id);
      const program = action.payload.data.program;
      const status = student.programs[program]
      studentEdit.programs[program] = status;
    },
    activateStudent: (state, action) => {
      const id = action.payload.data[0].id
      let student = state.employees.find(student => student.id === id);
      student.active = action.payload.data[0].active
    },
    updateBulkTime: (state, action) => {
      const studentIDs = Object.keys(action.payload.data.reduxUpdate)      
      const status = action.payload.data.reduxUpdate      
      const program = action.payload.data.program
      studentIDs.forEach((id) => {        
        let student = state.employees.find(student => student.id === id);
        if (status[id] === 'in') {
          student.programs[program] = 'in'
        } else {
          student.programs[program] = 'out'
        }
      })
    }
  },
})

export const {
  addEmployee,
  removeEmployee,
  timeClock,
  incrementByAmount,
  addEmployeeBulk,
  activateStudent,
  updateBulkTime,
  shiftStudentStatus
} = employeeListSlice.actions
export const teachers = (state) => state.employeeList.employees.filter(emp => emp.type?.toLowerCase() === 'teacher');
export const students = (state) => state.employeeList.employees.filter(emp => emp.type === 'student' && emp?.active !== false);
export const inactiveStudents = (state) => state.employeeList.employees.filter(emp => emp.type === 'student' && emp?.active === false);
export default employeeListSlice.reducer
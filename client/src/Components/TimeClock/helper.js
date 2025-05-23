import React, { useState } from "react";
import {
  Form,
  Card,
  Row,
  Col,
  InputGroup,
  Button,
  Modal,
  Dropdown
} from "react-bootstrap";
import { Calendar } from 'primereact/calendar';
import { getStudentHistory, getTimeFromMillisecond } from "../Dashboard/helpers";
import { useDispatch, useSelector } from "react-redux";
import { timeClock } from "../../app/EmployeeListSlice";
import { createItem, updateItem } from "../../globalUtils/requests";
import { customPrefs } from "../../app/PreferencesSlice";
import { Absent } from "./absent";



export const CheckinCheckoutButtons = ({ student, studentHistory, currentUser, setStatusChange, program }) => {

  const dispatch = useDispatch();
  const totalTimePrefs = useSelector(customPrefs).find((pref)=> pref.id == 'targetTime')?.value || 5;
  const [show, setShow] = useState(false);
  const [timeToEdit, setTimeToEdit] = useState();
  const [showTimeAlert, setShowTimeAlert] = useState();
  const [showCurrentlyClockedIn, setShowCurrentlyClockedIn] = useState()
  const [currentProgram, setCurrentProgram] = useState();
  const [alertData, setAlertData] = useState();
  const [absentModal, setAbsentModal] = useState(false);
  const [absentData, setAbsentData] = useState()
  let validationDate = {};
  let totalTimeWorked = 0;
  
  return (
    <Card
      className="timeClockCard"
      body>
      <Row>
        <Col xs={2}>
          <Card.Text className="timeClockCardTitle">
            {student.name}
          </Card.Text>
        </Col>
        <Col xs={2}>
          <Card.Text
            className="timeClockCardTitle"
          > {student.programs[program] == 'Absent' ?
            `Absent`:
            `Checked ${student.programs[program]}`
          }
            
          </Card.Text>
        </Col>
      </Row>
      {studentHistory.length > 0 ?
        studentHistory.map((doc, x) => {          
          const lastRecord = studentHistory.length - 1 == x
          const sessionHours = getHoursWorked(doc?.timeinMilli, doc?.timeOutMilli);
          totalTimeWorked += Number(sessionHours);
          return (
            <Form>
              <Row className="">
                <Col xs={4}>
                </Col>
                {
                  !(student.programs[program] == 'Absent') ? 
                  <Col xs={4}>
                  <InputGroup
                  onClick={(e) => {
                    if (e.target.id == 'timeIn') {
                        validationDate = { start: studentHistory[x - 1]?.timeOutMilli, end: studentHistory[x]?.timeOutMilli }
                      } else if (e.target.id == 'timeOut') {
                        validationDate = { start: studentHistory[x]?.timeinMilli, end: studentHistory[x + 1]?.timeinMilli }
                      }
                      setTimeToEdit({
                        action: e.target.id,
                        id: student.id,
                        timeMilli: e.target.id == 'timeIn' ? doc.timeinMilli : doc.timeOutMilli,
                        validationDate
                      })
                      if (lastRecord) {
                        setShow(true);
                      }
                    }}
                    className="mb-3 rowBorderBottom">
                    <Form.Control
                      id='timeIn'
                      value={doc?.timeIn ? convertMilitaryToStandard(getTimeFromMillisecond(doc?.timeinMilli)) : ''}
                      aria-label="Time In"
                      readOnly
                    />
                    <Form.Control
                      id='timeOut'
                      value={doc?.timeOut ? convertMilitaryToStandard(getTimeFromMillisecond(doc?.timeOutMilli)) : ''}
                      aria-label="Time Out"
                      readOnly
                      />
                  </InputGroup>
                </Col>
                      :<> Absent Reason: {doc.absentReason}</>}
                      
                <Col>
                  {sessionHours ? <p> {sessionHours} hrs</p> : ''}
                </Col>
                    
                <Col>
                  { x == studentHistory.length - 1 &&  student.programs[program] != 'Absent' ? 
                  <>
                  <Button
                    onClick={() => {
                      const timeClockData = {
                        student,
                        program,
                        time: `${new Date().getHours()}:${new Date().getMinutes()}`,
                        timeMilli: `${new Date().getTime()}`,
                        setBy: currentUser
                      }
                      const clockedinState = currentlyClockedIn(student.programs)
                      if (student.programs[program] == 'out' && clockedinState.clockedin) {
                        setShowCurrentlyClockedIn(true)
                        setCurrentProgram(clockedinState.program)
                      }
                      else if (totalTimeWorked < totalTimePrefs && student.programs[program] == 'in') {
                        setShowTimeAlert(true)
                        setAlertData(timeClockData);
                      } 
                      else {
                        createItem('/studenttimeclock', timeClockData);
                        dispatch(timeClock(timeClockData));
                        setStatusChange(true);
                      }
                      
                    }}
                    variant={student.programs[program] == "out" || student.programs[program] == "Absent" ? 'info' : 'danger'}>  {student.programs[program] == "out" ||student.programs[program] == "Absent" ? 'Check In' : 'Check Out'}
                  </Button> 
                  </>
                  :<></>}
                </Col>
                    
              </Row>
            </Form>)
        }) :
        <Form>
          <Row className="">
            <Col xs={2}>
            </Col>
            <Col xs={2}>
            </Col>
            <Col xs={4}>
              <InputGroup
                className="mb-3 rowBorderBottom">
                <Form.Control
                  id='timeIn'
                  aria-label="Time In"
                  readOnly
                />
                <Form.Control
                  id='timeOut'
                  aria-label="Time out"
                  readOnly
                />
              </InputGroup>
            </Col>
            <Col>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  const timeClockData = {
                    student,
                    program,
                    time: `${new Date().getHours()}:${new Date().getMinutes()}`,
                    timeMilli: `${new Date().getTime()}`,
                    setBy: currentUser
                  }
                  const clockedinState = currentlyClockedIn(student.programs)
                  if (student.programs[program] == 'out' && clockedinState.clockedin) {
                    setShowCurrentlyClockedIn(true)
                    setCurrentProgram(clockedinState.program)
                  }
                  else if (totalTimeWorked < totalTimePrefs && student.programs[program] == 'in') {
                    setShowTimeAlert(true)
                    setAlertData(timeClockData);
                  } else {
                    createItem('/studenttimeclock', timeClockData);
                    dispatch(timeClock(timeClockData));
                    setStatusChange(true);
                  }
                }}
                variant={student.programs[program] == "out" || student.programs[program] == "Absent" ? 'info' : 'danger'}>  {student.programs[program] == "out" || "Absent" ? 'Check In' : 'Check Out'}
              </Button>
              <Button
                onClick={()=>{
                  const timeClockData = {
                    student,
                    program,
                    timeMilli: `${new Date().getTime()}`,
                    setBy: currentUser
                  }
                  setAbsentData(timeClockData)
                  setAbsentModal(!absentModal)
                }}
                variant={'warning'}
              >Absent</Button>
            </Col>
          </Row>
        </Form>
      }
      <Row>
        <Col xs={{ span: 3, offset: 8 }}>
          <div className={totalTimeWorked >= totalTimePrefs ? "timeHit" : 'timeMissing'}>
          {student.programs[program] == 'Absent' ? <></>: `Todays Total Time :  ${totalTimeWorked.toFixed(2)}`}
          </div>
        </Col>
      </Row>
      {absentModal?<Absent setStatusChange={setStatusChange} absentData = {absentData} show={absentModal} setShow={setAbsentModal} studentName={student.name} />:<></>}
      {showCurrentlyClockedIn ? <AlreadyClockedInModal program={currentProgram} show={showCurrentlyClockedIn} setShow={setShowCurrentlyClockedIn} /> : <></>}
      {showTimeAlert ? <TimeAlertModal totalTime={totalTimeWorked} timeClockData={alertData} setStatusChange={setStatusChange} show={showTimeAlert} setShow={setShowTimeAlert} /> : <></>}
      {show ? <EditTimeModal show={show} setShow={setShow} timeToEdit={timeToEdit} setStatusChange={setStatusChange} program={program} /> : <></>}
    </Card>
  )
}

function currentlyClockedIn(programs) {
  let clockedIn = { 'clockedIn': false, 'program': '' };
  const programKeys = Object.keys(programs)
  if (programKeys.length == 1) return false;
  else {
    programKeys.forEach(key => {
      if (programs[key] == 'in') {
        clockedIn = { 'clockedin': true, 'program': key };
      }
    })
    return { ...clockedIn };
  }
}

export function AlreadyClockedInModal({ show, setShow, program }) {
  const handleClose = () => setShow(false);
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Body>
          <div>
            <h1>Student already clocked in at {program}</h1>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export function TimeAlertModal({ show, setShow, timeClockData, totalTime, setStatusChange }) {
  const earlyLeavePrefs = useSelector(customPrefs).find((pref) => pref.id == 'earlyLeaveReasons')?.value;
  const totalTimePrefs = useSelector(customPrefs).find((pref)=> pref.id == 'targetTime')?.value;
  // console.log(preferences);
  const [earlyClockoutReason, setEarlyClockoutReason] = useState()
  const handleClose = () => setShow(false);
  const dispatch = useDispatch()
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Body>
          <div>
            <h1>Time not Reached</h1>
            <p> Currently worked {totalTime} of {totalTimePrefs || 5} hours </p>
            <p> Select Early Clock out reason to check out before time is met</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" onClick={handleClose}>
            Keep Checked In
          </Button>
          
          <Dropdown>
            <Dropdown.Toggle variant="warning" id="dropdown-basic">
              {earlyClockoutReason || 'Early Checkout Reason'}
            </Dropdown.Toggle>

            <Dropdown.Menu
              onClick={(e) => {
                setEarlyClockoutReason(e.target.text)
              }}
            >
              {earlyLeavePrefs?.map(reason => (
                <Dropdown.Item
                >{reason}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Row>

          </Row>
        </Modal.Footer>

            {earlyClockoutReason ? 
        <Modal.Footer>
            <Button
              variant="danger"
              onClick={() => {
                timeClockData['earlyClockoutReason'] = earlyClockoutReason;
                createItem('/studenttimeclock', timeClockData);
                dispatch(timeClock(timeClockData));
                setStatusChange(true);
                handleClose();
              }
            }>
              Clock Out Early
            </Button> 
          </Modal.Footer>
            
            : <></>}
      </Modal>
    </>
  );
}

export function EditTimeModal({ show, setShow, timeToEdit, setStatusChange, program }) {

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [time, setTime] = useState(new Date(Number(timeToEdit.timeMilli)));
  const [error, setError] = useState();
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Body>
          <div>
            <Calendar value={time} onChange={(e) => setTime(e.value)} inline timeOnly hourFormat="12" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          {error ? <div className="errorMSG"> {error}</div> : ''}
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              // let chosenTime = new Date(time).getTime();
              let startDateFilter = timeToEdit.validationDate.start ? timeToEdit.validationDate.start : getTodayMillisecond();
              if (new Date(time).getTime() > startDateFilter && (new Date(time).getTime() < timeToEdit.validationDate.end || !timeToEdit.validationDate.end)) {
                updateTime(program, timeToEdit, { newTime: new Date(time).getTime() })
                setStatusChange(true)
                handleClose()
              } else {
                setError('Input Out of Range');
              }
            }
            }>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export function getHoursWorked(timein, timeout) {
  if (timein) {
    const clockedIn = timein
    const clockedOut = timeout ? timeout : new Date().getTime()
    return ((Number(clockedOut) - Number(clockedIn)) / (1000 * 60 * 60)).toFixed(2);
  }
  return null;
}

export function convertMilitaryToStandard(militaryTime) {
  try{
    if (militaryTime) {
      // Split the time string into hours and minutes
      const [hours, minutes] = militaryTime.split(":").map(Number);
      // Determine AM/PM
      const ampm = hours >= 12 ? "PM" : "AM";
      // Convert hours to 12-hour format
      const standardHours = hours % 12 || 12;
      // Format the standard time string
      const standardTime = `${standardHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      return standardTime;
    }
  }catch(e){
    return '';
  }
}

export function getLastTimeClockIn(history, studentid) {
  const lastCheck = getStudentHistory(studentid, Object.values(history))
  if (lastCheck.length > 0) {
    const lastDoc = lastCheck[0].clockedInOutHistory[lastCheck[0].clockedInOutHistory.length - 1]
    const secondToLastDoc = lastCheck[0].clockedInOutHistory[lastCheck[0].clockedInOutHistory.length - 2]
    let timeIn, timeinMilli, timeOutMilli, timeOut;
    timeOut = lastDoc.status == 'out' ? lastDoc.time : null;
    timeOutMilli = lastDoc.status == 'out' ? lastDoc.timeMilli : null;
    if (lastDoc.status == 'in') {
      timeIn = lastDoc.time
      timeinMilli = lastDoc.timeMilli
    } else {
      timeIn = secondToLastDoc.time
      timeinMilli = secondToLastDoc.timeMilli
    }
    return { timeIn, timeinMilli, timeOut, timeOutMilli }
  }
}

export function getstudentHistoryFromID(rawhistory, studentid, program) {
  let array = []
  array = Object.values(rawhistory).filter(doc => doc.id == studentid && doc[program] != undefined)
  return array.length > 0 ? array[0][program] : array
}

export function getTodaysClockInHistory(history) {
  const todayCollection = [];
  if (history) {
    const now = new Date();
    const milliSeconds = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    let timeIn, timeinMilli, timeOutMilli, timeOut = '00:00';
    history.forEach((record, x) => {
      
      let lastRecord = history.length == x + 1
      if (milliSeconds < Number(record.timeMilli)) {
        if (record.status == 'in') {
          timeIn = record.time
          timeinMilli = record.timeMilli
          if (lastRecord) {
            timeOut = ''
            timeOutMilli = '';
            todayCollection.push({ timeIn, timeinMilli, timeOut, timeOutMilli })
          }
        }
        if (record.status == 'Absent' && 'absentReason' in record) {
            todayCollection.push(
              {
                timeIn, 
                timeinMilli, 
                timeOut:'absent', 
                timeOutMilli:'absent',
                absentReason:record.absentReason
              })
        }
        else if (record.status == 'out') {
          timeOut = record.time
          timeOutMilli = record.timeMilli
          todayCollection.push({ timeIn, timeinMilli, timeOut, timeOutMilli })
        }
      }
    })
  }
  return todayCollection;
}

export function getTodayMillisecond() {
  const now = new Date();
  const milliSeconds = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return milliSeconds;
}

export function updateTime(program, currentTimeStamp, newTimeStamp) {

  const reqBody = {
    program,
    currentTimeStamp,
    newTimeStamp
  }
  updateItem('/updatetimeclock', reqBody)
}

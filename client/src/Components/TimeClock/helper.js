import React, { useState } from "react";
import {
  Form,
  Card,
  Row,
  Col,
  InputGroup,
  Button,
  Modal,
  Container
} from "react-bootstrap";
import { Calendar } from 'primereact/calendar';
import { getStudentHistory } from "../Dashboard/helpers";
import { useDispatch } from "react-redux";
import { timeClock } from "../../app/EmployeeListSlice";
import { createItem } from "../../globalUtils/requests";



export const CheckinCheckoutButtons = ({ student, studentHistory, currentUser, setStatusChange }) => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);

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
          >
            Checked {student.status}
          </Card.Text>
        </Col>
      </Row>
      {studentHistory.map((doc, x) => {
        const lastRecord = studentHistory.length-1 == x
        const sessionHours = getHoursWorked(doc?.timeinMilli, doc?.timeOutMilli)
        totalTimeWorked += Number(sessionHours);
        return (
          <Form>
            <Row className="">
              <Col xs={2}>

              </Col>

              <Col xs={4}>
                <InputGroup
                  onClick={() => {
                    if(lastRecord){
                      setShow(true);
                    }
                  }}
                  className="mb-3 rowBorderBottom">
                  <Form.Control
                    value={doc?.timeIn ? convertMilitaryToStandard(doc.timeIn) : ''}
                    aria-label="Time In" />
                  <Form.Control
                    value={doc?.timeOut ? convertMilitaryToStandard(doc.timeOut) : ''} aria-label="Time Out" />
                </InputGroup>
              </Col>
              <Col>
                {sessionHours ? <p> {sessionHours} hrs</p> : ''}
              </Col>
              <Col>
                {x == studentHistory.length - 1 ? <Button
                  onClick={() => {
                    const timeClockData = {
                      student,
                      time: `${new Date().getHours()}:${new Date().getMinutes()}`,
                      timeMilli: `${new Date().getTime()}`,
                      setBy: currentUser
                    }
                    createItem('/studenttimeclock', timeClockData);
                    dispatch(timeClock(timeClockData));
                    setStatusChange(true);
                  }}
                  variant={student.status == "out" ? 'info' : 'danger'}>  {student.status == "out" ? 'Check In' : 'Check Out'}
                </Button> : ''}
              </Col>
            </Row>
          </Form>)
      })}
      <Row>
        <Col xs={{ span: 3, offset: 8 }}>
          <div className={totalTimeWorked >= 5 ? "timeHit" : 'timeMissing'}>
            Todays Total Time :  {totalTimeWorked.toFixed(2)}
          </div>
        </Col>
      </Row>
    { show? <EditTimeModal show={show} setShow={setShow}/>:<></>}
    </Card>
  )
}
export function EditTimeModal({show, setShow}) {
  // const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [datetime12h, setDateTime12h] = useState(null);
  const [time, setTime] = useState(null);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        
        <Modal.Body>
        <div>
          <Calendar value={time} onChange={(e) => setTime(e.value)} inline timeOnly hourFormat="12" /> 
        </div>
        
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}


export function getHoursWorked(timein, timeout) {
  if (timein && timeout) {
    const clockedIn = timein
    const clockedOut = timeout
    return ((Number(clockedOut) - Number(clockedIn)) / (1000 * 60 * 60)).toFixed(2);
  }
  return null;
}


export function convertMilitaryToStandard(militaryTime) {
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
  return '';
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

export function getstudentHistoryFromID(rawhisory, studentid) {
  return Object.values(rawhisory).filter(doc => doc.id == studentid)[0]?.clockedInOutHistory
}


export function getTodaysClockInHistory(history) {
  const todayCollection = [];
  if (history) {
    let lastStatus = '';
    const now = new Date();
    const milliSeconds = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    let timeIn, timeinMilli, timeOutMilli, timeOut = '00:00';
    history.forEach((record, x) => {
      let lastRecord = history.length == x + 1

      if (milliSeconds < Number(record.timeMilli)) {
        if (record.status == 'in') {
          timeIn = record.time
          timeinMilli = record.timeMilli
          lastStatus = 'in'
          if (lastRecord) {
            console.log(lastRecord, record);
            timeOut = ''
            timeOutMilli = '';
            todayCollection.push({ timeIn, timeinMilli, timeOut, timeOutMilli })
          }
        }
        else if (record.status == 'out') {
          timeOut = record.time
          timeOutMilli = record.timeMilli
          todayCollection.push({ timeIn, timeinMilli, timeOut, timeOutMilli })
          lastStatus = 'out'
        }
      }
    })
  }
  return todayCollection;
}

import React, { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { setHistoryBulk, studentHistory } from "../../app/StudentHistorySlice";
import { getDateFromMilli, getStudentHistory, toCapitalize } from "../Dashboard/helpers";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { convertMilitaryToStandard } from "../TimeClock/helper";
import { updateItem } from "../../globalUtils/requests";
import { getPreviousSunday } from "./helpers";
import { isAdmin } from "../../app/CurrentUserSlice";
export const EditRecord = ({ record, list,admin }) => {
    const { id, name } = record;
    const history = useSelector(studentHistory)
    const recordHistory = getStudentHistory(id, Object.values(history))[0]?.clockedInOutHistory
    const daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

    const previousSunday = getPreviousSunday()
    const weeklyList = list.filter((doc) => doc.timeMilli > previousSunday)
    if (recordHistory) {
        return (
            <Fragment>
                <Row>
                    {
                        daysOfWeek.map((day) => {
                            return (
                                <Col>
                                    {

                                        weeklyList.map((historyRecord, x) => {
                                            const { status, timeMilli, time, setBy } = historyRecord;
                                            const dayOfRecord = getDayOfWeekFromMillisecond(timeMilli);
                                            if (dayOfRecord == day) {
                                                return (
                                                    <Fragment>
                                                        <Row key={`history_${x}`}>
                                                            <HourEditCard 
                                                                timeMilli={timeMilli} 
                                                                status={status} 
                                                                time={time} 
                                                                setBy={setBy} 
                                                                weeklyList={weeklyList} 
                                                                x={x} 
                                                                list={list} 
                                                                id={id} />
                                                        </Row>
                                                    </Fragment>
                                                )
                                            }
                                        })}
                                </Col>
                            )
                        })
                    }
                </Row>
            </Fragment>
        )
    }
}



function getDayOfWeekFromMillisecond(milliseconds) {
    const date = new Date(Number(milliseconds));
    const daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
    return daysOfWeek[date.getDay()];
}

function getMilliFromDateAndTime(date, time) {
    return new Date(`${date} ${time}`)
}

function HourEditCard({ timeMilli, status, time, setBy, weeklyList, id, x }) {
    const [recordChanges, setRecordChanges] = useState();
    const [error, setError] = useState();
    const admin = useSelector(isAdmin)
    console.log(`${x}`);
    
    return (
        <Card key={`card_${x}`}>
            <Card.Body key={`card_body${x}`}>
                <Card.Title key={`card_Title${x}`}>
                    <Card.Text key={`card_text${x}`}>
                        {getDayOfWeekFromMillisecond(timeMilli)}
                    </Card.Text>
                </Card.Title>
                <Form.Group key={`formgroup_${x}`}>
                    <Card.Text key={`card_1${x}`}>Clocked {toCapitalize(status)}</Card.Text>
                </Form.Group>
                <Form.Group key={`formcard_${x}`}>
                    <input
                        onBlur={(e) => { setRecordChanges({ ...recordChanges, date: e.target.value }) }}
                        defaultValue={getDateFromMilli(timeMilli)}></input>
                </Form.Group>
                <Form.Group>
                    <input
                        onBlur={(e) => { setRecordChanges({ ...recordChanges, time: e.target.value }) }}
                        defaultValue={convertMilitaryToStandard(time)}></input>
                </Form.Group>
                <Form.Group>
                    <input
                        onBlur={() => { setRecordChanges({ ...recordChanges, setBy }) }}
                        defaultValue={setBy}></input>
                </Form.Group>
                <Card.Footer>
                    <Row>
                        <Col
                            className={error ? "error-outofBounds":''}
                        >{error ? `${error}`:''}</Col>
                        <Col >
                        {admin?
                            <Button 
                            disabled={!recordChanges}
                                onClick={() => {
                                    const millisecondChange = new Date(`${recordChanges.date} ${recordChanges.time}`).getTime();
                               
                                    if (weeklyList[x].status == 'in' && 
                                        millisecondChange > Number(weeklyList[x-1].timeMilli) && 
                                        (weeklyList[x+1] == undefined || millisecondChange < Number(weeklyList[x+1].timeMilli))) {
                                        updateItem('/updatestudentrecord', { id, milliIndex: timeMilli, recordChanges }, setHistoryBulk) 
                                        setError('');
                                    } else if ( weeklyList[x].status == 'out' && 
                                        millisecondChange > Number(weeklyList[x-1].timeMilli) && 
                                        (weeklyList[x+1] == undefined || millisecondChange < Number(weeklyList[x+1].timeMilli))) {
                                            updateItem('/updatestudentrecord', { id, milliIndex: timeMilli, recordChanges }, setHistoryBulk) 
                                            setError('');
                                        }else{
                                            setError('Input Out of Bounds');
                                        }
                                    }}
                                    variant="info">Save</Button>:
                                    <></>
                                }
                        </Col>
                    </Row>
                </Card.Footer>
            </Card.Body>
        </Card>
    )
}
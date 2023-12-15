import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography, Button, TextField, Radio, RadioGroup, FormControlLabel } from '@material-ui/core';
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from'@material-ui/core';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import auth from '../lib/auth-helper';
import { listSurveyQuestions} from '../question/api-question';
import { surveyByID } from './api-survey';
import { checkCompletedSurvey, updateSurveyResult,downloadSurveyResult } from '../surveysubmit/api-submit';

const useStyles = makeStyles((theme) => ({
  card: {
    width: '40%',
    margin: '0 auto',
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: theme.spacing(2),
  },
  surveyCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    border: '1px solid #ccc',
  },
  biggerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(2),
  },
  questionsContainer: {
    marginTop: theme.spacing(3),
  },
  questionCard: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    border: '1px solid #ccc',
  },
  radioLabel: {
    display: 'block',
    marginBottom: theme.spacing(1),
  },
  radioGroup: {
    paddingLeft: 20,
  },
}));

const MySurveys = () => {
  const classes = useStyles();
  const jwt = auth.isAuthenticated();
  const { surveyId } = useParams();
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  const handleDownloadResult = () => {
    downloadSurveyResult({ surveyId: surveyId }, { t: jwt.token });
  };

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchSurveyDetails = async () => {
      try {
        const surveyData = await surveyByID({ surveyId: surveyId }, signal);

        if (surveyData.error) {
          setError(surveyData.error);
        } else {
          setCurrentSurvey(surveyData);
        }
      } catch (error) {
        console.error('Error in fetching survey details:', error);
        setError('Internal Server Error');
      }
    };

    const fetchSurveyQuestions = async () => {
      try {
        const questionsData = await listSurveyQuestions({ surveyId: surveyId }, signal);
        //console.log(questionsData);
        if (questionsData.error) {
          setError(questionsData.error);
        } else {
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error('Error in fetching survey questions:', error);
        setError('Internal Server Error');
      }
    };


    fetchSurveyDetails();
    fetchSurveyQuestions(); 

    return function cleanup() {
      abortController.abort();
    };
  }, [surveyId]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchSurveyDetails = async () => {
      try {
        const surveyData = await surveyByID({ surveyId: surveyId }, signal);

        if (surveyData.error) {
          setError(surveyData.error);
        } else {
          setCurrentSurvey(surveyData);
        }
      } catch (error) {
        console.error('Error in fetching survey details:', error);
        setError('Internal Server Error');
      }
    };

    const fetchSurveyQuestions = async () => {
      try {
        const questionsData = await listSurveyQuestions({ surveyId: surveyId }, signal);

        if (questionsData.error) {
          setError(questionsData.error);
        } else {
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error('Error in fetching survey questions:', error);
        setError('Internal Server Error');
      }
    };

    fetchSurveyDetails();
    fetchSurveyQuestions();

    return function cleanup() {
      abortController.abort();
    };
  }, [surveyId]);

  if (!currentSurvey) {
    return <div>Loading...</div>; // Add a loading indicator while fetching data.
  }

  return (
    <div>
      <Card className={classes.card}>
        <CardContent>
          {error ? (
            <Typography variant="h5" className={classes.errorText}>
              {error}
            </Typography>
          ) : jwt.user._id === currentSurvey.owner._id ? (
            <>
              <Typography variant="h5" className={classes.title}>
                Survey Details
              </Typography>
              <Typography className={classes.biggerText} color="primary" variant="contained">
                {currentSurvey.name}
              </Typography>
              {currentSurvey.dateExpire && (
                <Typography>
                  Expiration Date: {new Date(currentSurvey.dateExpire).toLocaleDateString()}
                </Typography>
              )}
              {!currentSurvey.dateExpire && (
                <Typography>NO EXPIRATION DATE</Typography>
              )}
              <Typography>
                Status: {currentSurvey.status}
              </Typography>
              <Typography>
                Owner: {currentSurvey.owner.firstName} {currentSurvey.owner.lastName} [
                {currentSurvey.owner.username}]
              </Typography>
              <div className={classes.buttonContainer}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={handleDownloadResult}
                >
                  Download Result
                </Button></div>

              <div className={classes.questionsContainer}>
                <Typography variant="h5" className={classes.title}>
                  Survey Questions
                </Typography>
                {questions.length === 0 ? (
                  <Typography variant="h6">There are no questions in this survey.</Typography>
                ) : (
                  questions.map((question, index) => (
                    <Card key={question._id} className={classes.questionCard}>
                      <Typography variant="subtitle1">
                        Question {question.questionOrder}: {question.name}
                      </Typography>

                      {question.questionType === 'MC' ? (
                        <RadioGroup>
                          {question.possibleAnswers.map((answer, answerIndex) => (
                            <FormControlLabel
                              key={answerIndex}
                              value={String(answerIndex)}
                              control={<Radio />}
                              label={`${answer} (${question.surveyResults[answerIndex]})`}
                            />
                          ))}
                        </RadioGroup>
                      ) : (
                        <ul>
                          {question.surveyResult2.map((answer, answerIndex) => (
                            <li key={answerIndex}>{answer}</li>
                          ))}
                        </ul>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
            <Typography variant="h4" style={{ color: 'red' }}>
              You are not the owner of this survey.
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MySurveys;
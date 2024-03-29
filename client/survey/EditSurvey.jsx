//CENTENNIAL COLLEGE COPY RIGHT GROUP 1 VAN NGUYEN 301289600 COMP229
// vdnnguyen94@gmail.com
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography, Button, TextField, Radio, RadioGroup, FormControlLabel } from '@material-ui/core';
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from'@material-ui/core';
import { Link, useParams, useNavigate} from 'react-router-dom';
import PropTypes from 'prop-types';
import auth from '../lib/auth-helper';
import { listSurveyQuestions} from '../question/api-question';
import { surveyByID,activateSurvey,inactivateSurvey,removeSurvey,updateSurvey } from './api-survey';
const useStyles = makeStyles((theme) => ({
  card: {
    width: '60%',
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

const EditSurvey = () => {
  const classes = useStyles();
  const jwt = auth.isAuthenticated();
  const { surveyId } = useParams();
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); 
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    window.location.reload();
  };

  const handleActivate = async () => {
      const result = await activateSurvey({ surveyId: surveyId }, {t: jwt.token});
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(true);
      }
  };

  const handleInactivate = async () => {
      const result = await inactivateSurvey({ surveyId: surveyId }, {t: jwt.token});
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(true);
      }
  };

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const handleRemove = async () => {
    try {
      const result = await removeSurvey({ surveyId: surveyId }, {t: jwt.token});
      if (result.error) {
        setError(result.error);
      } else {
        setRemoveDialogOpen(true);
      }
    } catch (error) {
      console.error('Error removing survey:', error);
      setError('Internal Server Error');
    }
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

    fetchSurveyDetails();

    return function cleanup() {
      abortController.abort();
    };
  }, [surveyId]);

  return (
    <div>
      <Card className={classes.card}>
        <CardContent>
          {error ? (
            <Typography variant="h5" className={classes.errorText}>
              {error}
            </Typography>
          ) : currentSurvey ? (
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
          {jwt.user._id === currentSurvey.owner._id && (
            <div className={classes.buttonContainer}>
              {/* Conditionally render Activate or Inactivate button */}
              {currentSurvey.status === 'ACTIVE' ? (
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={handleInactivate}
                >
                  Inactivate Survey
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={handleActivate}
                >
                  Activate Survey
                </Button>
              )}
              <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    component={Link}
                    to={`/survey/${surveyId}/editdetails`}
                  >
                    Edit Survey Details
              </Button> 
              <Button
                variant="contained"
                color="secondary"
                className={classes.button}
                onClick={handleRemove}
              >
                Remove Survey
              </Button>

            </div>
          )}

      
            </>
          ) : (
            <Typography variant="h5" className={classes.title}>
              Loading...
            </Typography>
          )}
        </CardContent>
      </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Survey</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your Survey is Updated
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Link to={`/survey/${surveyId}/edit`}>
            <Button color="primary" autoFocus variant="contained" onClick={handleClose}>
              Refresh
            </Button>
          </Link>
        </DialogActions> 
      </Dialog>
      <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
        <DialogTitle>Survey Removed</DialogTitle>
        <DialogContent>
          <DialogContentText>Your Survey has been successfully removed.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Link to="/surveys">
            <Button color="primary" autoFocus variant="contained">
              Go to Surveys
            </Button>
          </Link>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EditSurvey;
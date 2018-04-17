const Authentication = require('./controllers/authentication');
const PollController = require('./controllers/poll-controllers');

const passportService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignIn = passport.authenticate('local', {session: false });

module.exports = function(app) {
    app.get('/polls', PollController.index);
    app.get('/poll/:id', PollController.getPoll);
    app.get('/user/:id', requireAuth, PollController.getUserPolls);
    app.post('/signin',requireSignIn, Authentication.signin);
    app.post('/signup', Authentication.signup);
    app.post('/user/:id', requireAuth, PollController.createPoll);
    app.delete('/poll/:id', requireAuth, PollController.deletePoll);
};
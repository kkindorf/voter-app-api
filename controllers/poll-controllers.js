const User = require('../models/user');
const Poll = require('../models/poll');

module.exports = {
    index(req, res, next) {
        Poll.find(function(err, polls) {
            if(err) {
                res.json({
                    message: err
                })
            }
            else {
                res.json({data: polls})
            }
        })
    },
    getPoll(req, res,next) {
        const pollId = req.params.id;

        Poll.findOne({_id: pollId})
            .then((poll) => {
                res.status(200).json({data: poll})
            })
    },
    getUserPolls(req, res, next) {
        const userId = req.params.id;
        User.findOne({_id: userId})
            .populate('polls')
            .then((user) => {
                const polls = user.polls;
                res.send(polls);
            })
            .catch((err) => {
                res.status(400).json({data:'no data'})
            })
    },
    createPoll(req, res, next) {
        const pollProps = req.body;
        const userId = req.params.id;
        User.findOne({_id: userId})
        .then((user) => {
            var newPoll = new Poll({
                creator: userId,
                pollTitle: pollProps.pollTitle,
                pollOptions: pollProps.allOptions
            });
            newPoll.save()
                .then((poll) => {
                    res.status(200).json({
                        data: poll
                    })
                    user.polls.push(newPoll);
                    user.save();
                })
                .catch((e)=> {
                    res.status(400).json({
                        error: 'poll could not be saved'
                    })
                })
            
        })
        .catch((err) => {
            res.status(400).json({
                err: err
            })
        })
    },
    editPoll(req, res, next) {
        const pollProps = req.body;
        Poll.findOne({_id: req.params.id})
            .then((poll) => {
                poll.pollTitle = pollProps.pollTitle;
                poll.pollOptions = pollProps.pollOptions;
                poll.save()
                    .then((savedPoll) => {
                        res.status(200).json({
                            data: savedPoll,
                            message: 'poll saved soccessfully'
                        })
                    })
            })
    },
    deletePoll(req,res,next) {
        Poll.findOneAndRemove({
            _id:req.params.id
        })
        .then((poll) => {
            res.status(200).json({
                data: poll,
                message: 'poll deleted'
            })
        })
        .catch((e) => {
            res.status(400).json({
                data: 'error deleting poll'
            })
        })
    }
}
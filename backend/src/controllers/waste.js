const Waste = require('../models/waste')
const Account = require('../models/account')

module.exports = {
    delivery(req, res, next) {
        Account.findById(req.body.account).exec()
            .then(
                acct => new Waste({
                    account: acct.id,
                    quantity: req.body.quantity,
                    type: req.body.type
                }).save()
            )
            .then(
                doc => res.status(201).json(doc),
                err => next(err)
            )
    },
    query(req, res, next) {
        let q = null
        if (req.query.groupByType) {
            const pipeline = [
                {
                    $group: {
                        _id: "$type",
                        total: {$sum: "$quantity"}
                    }
                }, {
                    $project: {
                        _id: 0,
                        type: "$_id",
                        total: 1
                    }
                }
            ]
            if(req.query.includeDataPoints) {
                pipeline[0].$group.data = { $push:  { date: "$date", quantity: "$quantity" } }
                pipeline[1].$project.data = 1
            }
            let match = { }
            if (req.query.account) {
                match.account = req.query.account
            }
            if (req.query.from) {
                match.date = { $gte: new Date(req.query.from) }
            }
            if (req.query.to) {
                match.date = match.date || {}
                match.date.$lte = new Date(req.query.to)
            }
            if(Object.keys(match).length > 0) {
                pipeline.unshift({ $match: match })
            }
            q = Waste.aggregate(pipeline).then(result => {
                const sum = result.reduce((a,b) => a.total + b.total)
                result.map(r => {
                    r.percentage = r.total / sum
                    return r
                })
                return result
            })
        } else {
            q = Waste.find()
            if (req.query.account) {
                q.where('account', req.query.account)
            }
            if (req.query.from) {
                q.where('date').gte(new Date(req.query.from))
            }
            if (req.query.to) {
                q.where('date').lte(new Date(req.query.to))
            }
        }
        q.then(
            result => res.status(200).json(result),
            err => next(err)
        )
    }
}
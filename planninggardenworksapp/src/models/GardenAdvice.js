const mongoose = require('mongoose');

const gardenAdviceSchema = new mongoose.Schema({
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
    },
    data: {
        type: String,
        required: true,
    },
    list_of_work_link: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(v);
            },
            message: props => `${props.value} не является допустимым URL!`,
        },
    },
}, {
    timestamps: true,
});

const GardenAdvice = mongoose.model('garden-advice', gardenAdviceSchema);

module.exports = GardenAdvice;


const mongoose = require("mongoose");

const cmsContentSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: "main",
        },

        sections: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },

        banners: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },

        contentItems: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("CMSContent", cmsContentSchema);

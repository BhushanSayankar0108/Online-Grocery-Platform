
const fs = require("fs");
const path = require("path");
const CMSContent = require("../models/CMSContent");

const getCMSDocument = async () => {
    return CMSContent.findOneAndUpdate(
        { key: "main" },
        {
            $setOnInsert: {
                key: "main",
                sections: [],
                banners: [],
                contentItems: [],
            },
        },
        {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );
};

// Admin: fetch all CMS content
const getAdminCMS = async (req, res) => {
    try {
        const cms = await getCMSDocument();

        return res.status(200).json({
            success: true,
            data: {
                sections: cms.sections,
                banners: cms.banners,
                contentItems: cms.contentItems,
            },
        });
    } catch (error) {
        console.error("Get admin CMS error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch CMS content.",
        });
    }
};

// Admin: save CMS content
const saveAdminCMS = async (req, res) => {
    try {
        const { sections, banners, contentItems } = req.body;

        if (
            !Array.isArray(sections) ||
            !Array.isArray(banners) ||
            !Array.isArray(contentItems)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Sections, banners and contentItems must be arrays.",
            });
        }

        const cms = await getCMSDocument();

        cms.sections = sections;
        cms.banners = banners;
        cms.contentItems = contentItems;

        await cms.save();

        return res.status(200).json({
            success: true,
            message: "CMS content saved successfully.",
            data: {
                sections: cms.sections,
                banners: cms.banners,
                contentItems: cms.contentItems,
            },
        });
    } catch (error) {
        console.error("Save admin CMS error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to save CMS content.",
        });
    }
};

// Public: return active/published content only
const getPublicCMS = async (req, res) => {
    try {
        const cms = await CMSContent.findOne({ key: "main" }).lean();

        const isActive = (item) =>
            String(item.status || "").toLowerCase() === "active";

        return res.status(200).json({
            success: true,
            data: {
                sections: (cms?.sections || []).filter(isActive),
                banners: (cms?.banners || []).filter(isActive),
                contentItems: (cms?.contentItems || []).filter(isActive),
            },
        });
    } catch (error) {
        console.error("Get public CMS error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch published website content.",
        });
    }
};

// Admin: save uploaded images to backend/uploads/cms
const uploadCMSImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one image.",
            });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const images = req.files.map((file) => ({
            filename: file.filename,
            url: `${baseUrl}/uploads/cms/${file.filename}`,
            originalName: file.originalname,
        }));

        return res.status(201).json({
            success: true,
            message: "Images uploaded successfully.",
            images,
        });
    } catch (error) {
        console.error("CMS image upload error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to upload CMS images.",
        });
    }
};

module.exports = {
    getAdminCMS,
    saveAdminCMS,
    getPublicCMS,
    uploadCMSImages,
};

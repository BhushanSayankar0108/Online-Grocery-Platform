import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Edit,
  Eye,
  FileText,
  Image,
  Layout,
  Plus,
  Search,
  Settings2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminCMS.css";

const initialSections = [
  {
    id: 1,
    name: "Hero Banner",
    description: "Main banner displayed at the top of the homepage.",
    status: "active",
  },
  {
    id: 2,
    name: "Featured Categories",
    description: "Display selected grocery categories on the homepage.",
    status: "active",
  },
  {
    id: 3,
    name: "Featured Products",
    description: "Display selected products on the homepage.",
    status: "active",
  },
  {
    id: 4,
    name: "Deal of the Day",
    description: "Highlight special daily offers and discounted products.",
    status: "active",
  },
  {
    id: 5,
    name: "Promotional Banner",
    description: "Display promotional campaigns and seasonal offers.",
    status: "active",
  },
  {
    id: 6,
    name: "Newsletter",
    description: "Newsletter subscription section for customers.",
    status: "inactive",
  },
];

const initialBanners = [
  {
    id: 1,
    title: "Fresh Groceries Delivered",
    subtitle: "Fresh products delivered to your doorstep.",
    buttonText: "Shop Now",
    status: "active",
    image: "",
  },
  {
    id: 2,
    title: "Fresh Fruits & Vegetables",
    subtitle: "Healthy and fresh products for your family.",
    buttonText: "Explore Now",
    status: "active",
    image: "",
  },
  {
    id: 3,
    title: "Weekend Special Offers",
    subtitle: "Save more on your favourite grocery products.",
    buttonText: "View Offers",
    status: "inactive",
    image: "",
  },
];

const initialContent = [
  {
    id: 1,
    type: "about",
    title: "About Us",
    content:
      "We provide fresh and quality grocery products with convenient doorstep delivery.",
    status: "active",
  },
  {
    id: 2,
    type: "contact",
    title: "Contact Information",
    content:
      "Email: support@grocery.com | Phone: +91 98765 43210 | Mon-Sat: 9:00 AM - 7:00 PM",
    status: "active",
  },
  {
    id: 3,
    type: "footer",
    title: "Footer Content",
    content:
      "Your trusted online grocery platform for fresh products and convenient shopping.",
    status: "active",
  },
];

function AdminCMS() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("sections");
  const [searchTerm, setSearchTerm] = useState("");

  const [sections, setSections] = useState(initialSections);
  const [banners, setBanners] = useState(initialBanners);
  const [contentItems, setContentItems] = useState(initialContent);

  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [sectionForm, setSectionForm] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    status: "active",
    image: "",
  });

  const [contentForm, setContentForm] = useState({
    title: "",
    content: "",
    status: "active",
  });

  const filteredSections = useMemo(() => {
    return sections.filter((section) =>
      `${section.name} ${section.description}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [sections, searchTerm]);

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) =>
      `${banner.title} ${banner.subtitle}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [banners, searchTerm]);

  const filteredContent = useMemo(() => {
    return contentItems.filter((item) =>
      `${item.title} ${item.content}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [contentItems, searchTerm]);

  const totalSections = sections.length;

  const activeSections = sections.filter(
    (item) => item.status === "active"
  ).length;

  const totalBanners = banners.length;

  const activeContent = contentItems.filter(
    (item) => item.status === "active"
  ).length;

  const openSectionModal = (item = null) => {
    setEditingItem(item);

    if (item) {
      setSectionForm({
        name: item.name,
        description: item.description,
        status: item.status,
      });
    } else {
      setSectionForm({
        name: "",
        description: "",
        status: "active",
      });
    }

    setModalType("section");
  };

  const openBannerModal = (item = null) => {
    setEditingItem(item);

    if (item) {
      setBannerForm({
        title: item.title,
        subtitle: item.subtitle,
        buttonText: item.buttonText,
        status: item.status,
        image: item.image,
      });
    } else {
      setBannerForm({
        title: "",
        subtitle: "",
        buttonText: "",
        status: "active",
        image: "",
      });
    }

    setModalType("banner");
  };

  const openContentModal = (item = null) => {
    setEditingItem(item);

    if (item) {
      setContentForm({
        title: item.title,
        content: item.content,
        status: item.status,
      });
    } else {
      setContentForm({
        title: "",
        content: "",
        status: "active",
      });
    }

    setModalType("content");
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
  };

  const handleSectionSubmit = (event) => {
    event.preventDefault();

    if (!sectionForm.name.trim()) {
      alert("Please enter section name.");
      return;
    }

    if (editingItem) {
      setSections((previous) =>
        previous.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...sectionForm,
              }
            : item
        )
      );
    } else {
      setSections((previous) => [
        ...previous,
        {
          id: Date.now(),
          ...sectionForm,
        },
      ]);
    }

    closeModal();
  };

  const handleBannerSubmit = (event) => {
    event.preventDefault();

    if (!bannerForm.title.trim()) {
      alert("Please enter banner title.");
      return;
    }

    if (editingItem) {
      setBanners((previous) =>
        previous.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...bannerForm,
              }
            : item
        )
      );
    } else {
      setBanners((previous) => [
        ...previous,
        {
          id: Date.now(),
          ...bannerForm,
        },
      ]);
    }

    closeModal();
  };

  const handleContentSubmit = (event) => {
    event.preventDefault();

    if (!contentForm.title.trim()) {
      alert("Please enter content title.");
      return;
    }

    if (!contentForm.content.trim()) {
      alert("Please enter content.");
      return;
    }

    if (editingItem) {
      setContentItems((previous) =>
        previous.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...contentForm,
              }
            : item
        )
      );
    } else {
      setContentItems((previous) => [
        ...previous,
        {
          id: Date.now(),
          type: "custom",
          ...contentForm,
        },
      ]);
    }

    closeModal();
  };

  const toggleSectionStatus = (id) => {
    setSections((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "active" ? "inactive" : "active",
            }
          : item
      )
    );
  };

  const toggleBannerStatus = (id) => {
    setBanners((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "active" ? "inactive" : "active",
            }
          : item
      )
    );
  };

  const toggleContentStatus = (id) => {
    setContentItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "active" ? "inactive" : "active",
            }
          : item
      )
    );
  };

  const deleteSection = (id) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      setSections((previous) =>
        previous.filter((item) => item.id !== id)
      );
    }
  };

  const deleteBanner = (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setBanners((previous) =>
        previous.filter((item) => item.id !== id)
      );
    }
  };

  const deleteContent = (id) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      setContentItems((previous) =>
        previous.filter((item) => item.id !== id)
      );
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setBannerForm((previous) => ({
        ...previous,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const renderStatus = (status) => {
    return (
      <span className={`cms-status ${status}`}>
        {status === "active" ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <div className="admin-cms-page">
      <div className="cms-container">
        <div className="cms-top-row">
          <button
            className="cms-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        <div className="cms-header">
          <div className="cms-title-wrapper">
            <div className="cms-title-icon">
              <FileText size={25} />
            </div>

            <div>
              <h1>Website CMS</h1>
              <p>
                Manage website sections, banners and content from one place.
              </p>
            </div>
          </div>

          <div className="cms-header-actions">
            {activeTab === "sections" && (
              <button
                className="cms-primary-button"
                onClick={() => openSectionModal()}
              >
                <Plus size={18} />
                Add Section
              </button>
            )}

            {activeTab === "banners" && (
              <button
                className="cms-primary-button"
                onClick={() => openBannerModal()}
              >
                <Plus size={18} />
                Add Banner
              </button>
            )}

            {activeTab === "content" && (
              <button
                className="cms-primary-button"
                onClick={() => openContentModal()}
              >
                <Plus size={18} />
                Add Content
              </button>
            )}
          </div>
        </div>

        <div className="cms-stats-grid">
          <div className="cms-stat-card">
            <div className="cms-stat-icon">
              <Layout size={22} />
            </div>

            <div>
              <span>Total Sections</span>
              <strong>{totalSections}</strong>
            </div>
          </div>

          <div className="cms-stat-card">
            <div className="cms-stat-icon">
              <ToggleRight size={22} />
            </div>

            <div>
              <span>Active Sections</span>
              <strong>{activeSections}</strong>
            </div>
          </div>

          <div className="cms-stat-card">
            <div className="cms-stat-icon">
              <Image size={22} />
            </div>

            <div>
              <span>Total Banners</span>
              <strong>{totalBanners}</strong>
            </div>
          </div>

          <div className="cms-stat-card">
            <div className="cms-stat-icon">
              <FileText size={22} />
            </div>

            <div>
              <span>Active Content</span>
              <strong>{activeContent}</strong>
            </div>
          </div>
        </div>

        <div className="cms-tabs-card">
          <div className="cms-tabs">
            <button
              className={activeTab === "sections" ? "active" : ""}
              onClick={() => {
                setActiveTab("sections");
                setSearchTerm("");
              }}
            >
              <Layout size={18} />
              Home Sections
            </button>

            <button
              className={activeTab === "banners" ? "active" : ""}
              onClick={() => {
                setActiveTab("banners");
                setSearchTerm("");
              }}
            >
              <Image size={18} />
              Banners
            </button>

            <button
              className={activeTab === "content" ? "active" : ""}
              onClick={() => {
                setActiveTab("content");
                setSearchTerm("");
              }}
            >
              <FileText size={18} />
              Website Content
            </button>
          </div>
        </div>

        <div className="cms-toolbar">
          <div className="cms-search">
            <Search size={18} />

            <input
              type="text"
              placeholder={
                activeTab === "sections"
                  ? "Search sections..."
                  : activeTab === "banners"
                  ? "Search banners..."
                  : "Search content..."
              }
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="cms-toolbar-info">
            <Settings2 size={17} />
            Frontend Preview Mode
          </div>
        </div>

        {activeTab === "sections" && (
          <div className="cms-table-card">
            <div className="cms-table-header">
              <div>
                <h2>Homepage Sections</h2>
                <p>
                  Control which sections appear on the public homepage.
                </p>
              </div>
            </div>

            <div className="cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSections.length > 0 ? (
                    filteredSections.map((section) => (
                      <tr key={section.id}>
                        <td>
                          <div className="cms-name-cell">
                            <div className="cms-row-icon">
                              <Layout size={18} />
                            </div>

                            <strong>{section.name}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="cms-description">
                            {section.description}
                          </span>
                        </td>

                        <td>
                          <button
                            className="cms-status-toggle"
                            onClick={() =>
                              toggleSectionStatus(section.id)
                            }
                          >
                            {section.status === "active" ? (
                              <ToggleRight size={24} />
                            ) : (
                              <ToggleLeft size={24} />
                            )}

                            {renderStatus(section.status)}
                          </button>
                        </td>

                        <td>
                          <div className="cms-action-buttons">
                            <button
                              className="cms-icon-button edit"
                              title="Edit"
                              onClick={() =>
                                openSectionModal(section)
                              }
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              className="cms-icon-button delete"
                              title="Delete"
                              onClick={() =>
                                deleteSection(section.id)
                              }
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="cms-empty-state">
                          No sections found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "banners" && (
          <div className="cms-table-card">
            <div className="cms-table-header">
              <div>
                <h2>Website Banners</h2>
                <p>
                  Manage promotional and homepage banner content.
                </p>
              </div>
            </div>

            <div className="cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Banner</th>
                    <th>Subtitle</th>
                    <th>Button</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBanners.length > 0 ? (
                    filteredBanners.map((banner) => (
                      <tr key={banner.id}>
                        <td>
                          <div className="cms-name-cell">
                            <div className="cms-banner-thumb">
                              {banner.image ? (
                                <img
                                  src={banner.image}
                                  alt={banner.title}
                                />
                              ) : (
                                <Image size={20} />
                              )}
                            </div>

                            <strong>{banner.title}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="cms-description">
                            {banner.subtitle}
                          </span>
                        </td>

                        <td>
                          <span className="cms-button-preview">
                            {banner.buttonText}
                          </span>
                        </td>

                        <td>
                          <button
                            className="cms-status-toggle"
                            onClick={() =>
                              toggleBannerStatus(banner.id)
                            }
                          >
                            {banner.status === "active" ? (
                              <ToggleRight size={24} />
                            ) : (
                              <ToggleLeft size={24} />
                            )}

                            {renderStatus(banner.status)}
                          </button>
                        </td>

                        <td>
                          <div className="cms-action-buttons">
                            <button
                              className="cms-icon-button view"
                              title="Preview"
                              onClick={() =>
                                openBannerModal(banner)
                              }
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              className="cms-icon-button edit"
                              title="Edit"
                              onClick={() =>
                                openBannerModal(banner)
                              }
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              className="cms-icon-button delete"
                              title="Delete"
                              onClick={() =>
                                deleteBanner(banner.id)
                              }
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">
                        <div className="cms-empty-state">
                          No banners found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="cms-table-card">
            <div className="cms-table-header">
              <div>
                <h2>Website Content</h2>
                <p>
                  Manage general website information and footer content.
                </p>
              </div>
            </div>

            <div className="cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Content</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredContent.length > 0 ? (
                    filteredContent.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="cms-name-cell">
                            <div className="cms-row-icon">
                              <FileText size={18} />
                            </div>

                            <strong>{item.title}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="cms-content-preview">
                            {item.content}
                          </span>
                        </td>

                        <td>
                          <button
                            className="cms-status-toggle"
                            onClick={() =>
                              toggleContentStatus(item.id)
                            }
                          >
                            {item.status === "active" ? (
                              <ToggleRight size={24} />
                            ) : (
                              <ToggleLeft size={24} />
                            )}

                            {renderStatus(item.status)}
                          </button>
                        </td>

                        <td>
                          <div className="cms-action-buttons">
                            <button
                              className="cms-icon-button edit"
                              title="Edit"
                              onClick={() =>
                                openContentModal(item)
                              }
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              className="cms-icon-button delete"
                              title="Delete"
                              onClick={() =>
                                deleteContent(item.id)
                              }
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="cms-empty-state">
                          No content found.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalType === "section" && (
        <div className="cms-modal-overlay" onClick={closeModal}>
          <div
            className="cms-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cms-modal-header">
              <div>
                <h2>
                  {editingItem ? "Edit Section" : "Add Section"}
                </h2>

                <p>Configure homepage section details.</p>
              </div>

              <button
                className="cms-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSectionSubmit}>
              <div className="cms-form-group">
                <label>Section Name</label>

                <input
                  type="text"
                  value={sectionForm.name}
                  onChange={(event) =>
                    setSectionForm({
                      ...sectionForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter section name"
                />
              </div>

              <div className="cms-form-group">
                <label>Description</label>

                <textarea
                  value={sectionForm.description}
                  onChange={(event) =>
                    setSectionForm({
                      ...sectionForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Enter section description"
                  rows="4"
                />
              </div>

              <div className="cms-form-group">
                <label>Status</label>

                <select
                  value={sectionForm.status}
                  onChange={(event) =>
                    setSectionForm({
                      ...sectionForm,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="cms-modal-footer">
                <button
                  type="button"
                  className="cms-secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cms-primary-button"
                >
                  {editingItem ? "Update Section" : "Add Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === "banner" && (
        <div className="cms-modal-overlay" onClick={closeModal}>
          <div
            className="cms-modal cms-banner-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cms-modal-header">
              <div>
                <h2>
                  {editingItem ? "Edit Banner" : "Add Banner"}
                </h2>

                <p>Configure banner content and image.</p>
              </div>

              <button
                className="cms-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit}>
              <div className="cms-form-group">
                <label>Banner Image</label>

                <div className="cms-upload-box">
                  {bannerForm.image ? (
                    <div className="cms-upload-preview">
                      <img
                        src={bannerForm.image}
                        alt="Banner preview"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setBannerForm({
                            ...bannerForm,
                            image: "",
                          })
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} />

                      <strong>Upload Banner Image</strong>

                      <span>
                        Recommended for homepage banners
                      </span>

                      <label className="cms-upload-button">
                        Choose Image

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="cms-form-group">
                <label>Banner Title</label>

                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(event) =>
                    setBannerForm({
                      ...bannerForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="Enter banner title"
                />
              </div>

              <div className="cms-form-group">
                <label>Subtitle</label>

                <textarea
                  value={bannerForm.subtitle}
                  onChange={(event) =>
                    setBannerForm({
                      ...bannerForm,
                      subtitle: event.target.value,
                    })
                  }
                  placeholder="Enter banner subtitle"
                  rows="3"
                />
              </div>

              <div className="cms-form-row">
                <div className="cms-form-group">
                  <label>Button Text</label>

                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(event) =>
                      setBannerForm({
                        ...bannerForm,
                        buttonText: event.target.value,
                      })
                    }
                    placeholder="Example: Shop Now"
                  />
                </div>

                <div className="cms-form-group">
                  <label>Status</label>

                  <select
                    value={bannerForm.status}
                    onChange={(event) =>
                      setBannerForm({
                        ...bannerForm,
                        status: event.target.value,
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="cms-modal-footer">
                <button
                  type="button"
                  className="cms-secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cms-primary-button"
                >
                  {editingItem ? "Update Banner" : "Add Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === "content" && (
        <div className="cms-modal-overlay" onClick={closeModal}>
          <div
            className="cms-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cms-modal-header">
              <div>
                <h2>
                  {editingItem ? "Edit Content" : "Add Content"}
                </h2>

                <p>
                  Manage website information and text content.
                </p>
              </div>

              <button
                className="cms-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleContentSubmit}>
              <div className="cms-form-group">
                <label>Content Title</label>

                <input
                  type="text"
                  value={contentForm.title}
                  onChange={(event) =>
                    setContentForm({
                      ...contentForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="Enter content title"
                />
              </div>

              <div className="cms-form-group">
                <label>Content</label>

                <textarea
                  value={contentForm.content}
                  onChange={(event) =>
                    setContentForm({
                      ...contentForm,
                      content: event.target.value,
                    })
                  }
                  placeholder="Enter website content"
                  rows="7"
                />
              </div>

              <div className="cms-form-group">
                <label>Status</label>

                <select
                  value={contentForm.status}
                  onChange={(event) =>
                    setContentForm({
                      ...contentForm,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="cms-modal-footer">
                <button
                  type="button"
                  className="cms-secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cms-primary-button"
                >
                  {editingItem ? "Update Content" : "Add Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCMS;
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Edit,
  Eye,
  FileText,
  Image as ImageIcon,
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

import "./AdminCMS.css";

const CMS_API_BASE = "http://localhost:5000/api/cms";

const getAdminToken = () => localStorage.getItem("adminToken");

const cmsRequest = async (url, options = {}) => {
  const token = getAdminToken();
  const headers = { ...(options.headers || {}) };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, { ...options, headers });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result;
};

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
    images: [],
  },
  {
    id: 2,
    title: "Fresh Fruits & Vegetables",
    subtitle: "Healthy and fresh products for your family.",
    buttonText: "Explore Now",
    status: "active",
    images: [],
  },
  {
    id: 3,
    title: "Weekend Special Offers",
    subtitle: "Save more on your favourite grocery products.",
    buttonText: "View Offers",
    status: "inactive",
    images: [],
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

const emptySectionForm = {
  name: "",
  description: "",
  status: "active",
};

const emptyBannerForm = {
  title: "",
  subtitle: "",
  buttonText: "",
  status: "active",
  images: [],
};

const emptyContentForm = {
  title: "",
  content: "",
  status: "active",
};

const emptyFAQForm = {
  title: "",
  content: "",
  status: "active",
  order: 1,
};

const getBannerImages = (banner) => {
  if (Array.isArray(banner.images)) {
    return banner.images.filter(Boolean);
  }

  return banner.image ? [banner.image] : [];
};

function AdminCMS() {
  const [activeTab, setActiveTab] = useState("sections");
  const [searchTerm, setSearchTerm] = useState("");

  const [sections, setSections] = useState(initialSections);
  const [banners, setBanners] = useState(initialBanners);
  const [contentItems, setContentItems] = useState(initialContent);
  const [cmsLoaded, setCmsLoaded] = useState(false);
  const [cmsSaving, setCmsSaving] = useState(false);
  const saveTimerRef = useRef(null);
  const saveVersionRef = useRef(0);

  // Load saved CMS data from MongoDB when the page opens.
  useEffect(() => {
    let cancelled = false;

    const loadCMS = async () => {
      try {
        const result = await cmsRequest(`${CMS_API_BASE}/admin`);
        if (cancelled) return;

        const data = result.data || {};
        const savedSections = Array.isArray(data.sections) ? data.sections : [];
        const savedBanners = Array.isArray(data.banners) ? data.banners : [];
        const savedContent = Array.isArray(data.contentItems) ? data.contentItems : [];

        if (
          savedSections.length === 0 &&
          savedBanners.length === 0 &&
          savedContent.length === 0
        ) {
          // Preserve the existing demo content on the first setup and save it to the database.
          setSections(initialSections);
          setBanners(initialBanners);
          setContentItems(initialContent);
          await cmsRequest(`${CMS_API_BASE}/admin`, {
            method: "PUT",
            body: JSON.stringify({
              sections: initialSections,
              banners: initialBanners,
              contentItems: initialContent,
            }),
          });
        } else {
          setSections(savedSections);
          setBanners(savedBanners);
          setContentItems(savedContent);
        }
      } catch (error) {
        console.error("Unable to load CMS data:", error);
        window.alert(
          `Unable to load CMS data from the server. ${error.message}`
        );
      } finally {
        if (!cancelled) setCmsLoaded(true);
      }
    };

    loadCMS();
    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Persist changes made by add/edit, status toggle and delete actions.
  useEffect(() => {
    if (!cmsLoaded) return undefined;

    const version = ++saveVersionRef.current;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setCmsSaving(true);
      try {
        await cmsRequest(`${CMS_API_BASE}/admin`, {
          method: "PUT",
          body: JSON.stringify({ sections, banners, contentItems }),
        });
      } catch (error) {
        console.error("Unable to save CMS data:", error);
        window.alert(`CMS changes could not be saved. ${error.message}`);
      } finally {
        if (version === saveVersionRef.current) setCmsSaving(false);
      }
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [sections, banners, contentItems, cmsLoaded]);

  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingBanner, setViewingBanner] = useState(null);

  const [sectionForm, setSectionForm] = useState({
    ...emptySectionForm,
  });

  const [bannerForm, setBannerForm] = useState({
    ...emptyBannerForm,
  });

  const [contentForm, setContentForm] = useState({
    ...emptyContentForm,
  });

  const [faqForm, setFaqForm] = useState({ ...emptyFAQForm });

  const [originalForm, setOriginalForm] = useState(null);
  const [imageError, setImageError] = useState("");

  const search = searchTerm.trim().toLowerCase();

  const filteredSections = useMemo(
    () =>
      sections.filter((item) =>
        `${item.name} ${item.description}`
          .toLowerCase()
          .includes(search)
      ),
    [sections, search]
  );

  const filteredBanners = useMemo(
    () =>
      banners.filter((item) =>
        `${item.title} ${item.subtitle}`
          .toLowerCase()
          .includes(search)
      ),
    [banners, search]
  );

  const filteredContent = useMemo(
    () =>
      contentItems.filter(
        (item) =>
          item.type !== "faq" &&
          `${item.title} ${item.content}`.toLowerCase().includes(search)
      ),
    [contentItems, search]
  );

  const faqItems = useMemo(
    () =>
      contentItems
        .filter((item) => item.type === "faq")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [contentItems]
  );

  const filteredFAQs = useMemo(
    () =>
      faqItems.filter((item) =>
        `${item.title} ${item.content}`.toLowerCase().includes(search)
      ),
    [faqItems, search]
  );

  const totalSections = sections.length;

  const activeSections = sections.filter(
    (item) => item.status === "active"
  ).length;

  const totalBanners = banners.length;

  const activeContent = contentItems.filter(
    (item) => item.status === "active"
  ).length;

  const getCurrentForm = () => {
    if (modalType === "section") return sectionForm;
    if (modalType === "banner") return bannerForm;
    if (modalType === "content") return contentForm;
    if (modalType === "faq") return faqForm;

    return null;
  };

  const hasUnsavedChanges = () => {
    const currentForm = getCurrentForm();

    return Boolean(
      currentForm &&
        originalForm &&
        JSON.stringify(currentForm) !== JSON.stringify(originalForm)
    );
  };

  const closeModal = () => {
    if (
      hasUnsavedChanges() &&
      !window.confirm(
        "You have unsaved changes. Discard them and close this form?"
      )
    ) {
      return;
    }

    setModalType(null);
    setEditingItem(null);
    setOriginalForm(null);
    setImageError("");
  };

  const openSectionModal = (item = null) => {
    if (
      modalType &&
      hasUnsavedChanges() &&
      !window.confirm(
        "Discard the current unsaved changes and open another form?"
      )
    ) {
      return;
    }

    const form = item
      ? {
          name: item.name,
          description: item.description,
          status: item.status,
        }
      : { ...emptySectionForm };

    setEditingItem(item);
    setSectionForm(form);
    setOriginalForm({ ...form });
    setModalType("section");
    setImageError("");
  };

  const openBannerModal = (item = null) => {
    if (
      modalType &&
      hasUnsavedChanges() &&
      !window.confirm(
        "Discard the current unsaved changes and open another form?"
      )
    ) {
      return;
    }

    const form = item
      ? {
          title: item.title,
          subtitle: item.subtitle,
          buttonText: item.buttonText,
          status: item.status,
          images: getBannerImages(item),
        }
      : { ...emptyBannerForm, images: [] };

    setEditingItem(item);
    setBannerForm(form);
    setOriginalForm(JSON.parse(JSON.stringify(form)));
    setModalType("banner");
    setImageError("");
  };

  const openContentModal = (item = null) => {
    if (
      modalType &&
      hasUnsavedChanges() &&
      !window.confirm(
        "Discard the current unsaved changes and open another form?"
      )
    ) {
      return;
    }

    const form = item
      ? {
          title: item.title,
          content: item.content,
          status: item.status,
        }
      : { ...emptyContentForm };

    setEditingItem(item);
    setContentForm(form);
    setOriginalForm({ ...form });
    setModalType("content");
  };

  const openFAQModal = (item = null) => {
    if (
      modalType &&
      hasUnsavedChanges() &&
      !window.confirm(
        "Discard the current unsaved changes and open another form?"
      )
    ) {
      return;
    }

    const form = item
      ? {
          title: item.title || "",
          content: item.content || "",
          status: item.status || "active",
          order: Number(item.order || 1),
        }
      : { ...emptyFAQForm, order: faqItems.length + 1 };

    setEditingItem(item);
    setFaqForm(form);
    setOriginalForm({ ...form });
    setModalType("faq");
  };

  const handleFAQSubmit = (event) => {
    event.preventDefault();

    const title = faqForm.title.trim();
    const content = faqForm.content.trim();
    const order = Number(faqForm.order);

    if (!title || !content) {
      window.alert("Please enter both the question and answer.");
      return;
    }

    if (!Number.isInteger(order) || order < 1) {
      window.alert("Display order must be a positive whole number.");
      return;
    }

    const duplicate = faqItems.some(
      (item) =>
        item.id !== editingItem?.id &&
        item.title.trim().toLowerCase() === title.toLowerCase()
    );

    if (duplicate) {
      window.alert("This FAQ question already exists.");
      return;
    }

    const faqData = {
      ...faqForm,
      type: "faq",
      title,
      content,
      order,
    };

    if (editingItem) {
      setContentItems((previous) =>
        previous.map((item) =>
          item.id === editingItem.id ? { ...item, ...faqData } : item
        )
      );
    } else {
      setContentItems((previous) => [
        ...previous,
        { id: Date.now(), ...faqData },
      ]);
    }

    setModalType(null);
    setEditingItem(null);
    setOriginalForm(null);
  };

  const handleSectionSubmit = (event) => {
    event.preventDefault();

    const name = sectionForm.name.trim();
    const description = sectionForm.description.trim();

    if (!name) {
      window.alert("Please enter section name.");
      return;
    }

    const duplicate = sections.some(
      (item) =>
        item.id !== editingItem?.id &&
        item.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      window.alert("A section with this name already exists.");
      return;
    }

    const sectionData = {
      ...sectionForm,
      name,
      description,
    };

    if (editingItem) {
      setSections((previous) =>
        previous.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...sectionData }
            : item
        )
      );
    } else {
      setSections((previous) => [
        ...previous,
        { id: Date.now(), ...sectionData },
      ]);
    }

    setModalType(null);
    setEditingItem(null);
    setOriginalForm(null);
  };

  const handleBannerSubmit = (event) => {
    event.preventDefault();

    const title = bannerForm.title.trim();

    if (!title) {
      window.alert("Please enter banner title.");
      return;
    }

    const duplicate = banners.some(
      (item) =>
        item.id !== editingItem?.id &&
        item.title.trim().toLowerCase() === title.toLowerCase()
    );

    if (duplicate) {
      window.alert("A banner with this title already exists.");
      return;
    }

    const images = [...bannerForm.images];

    const bannerData = {
      ...bannerForm,
      title,
      images,
      image: images[0] || "",
    };

    if (editingItem) {
      setBanners((previous) =>
        previous.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...bannerData }
            : item
        )
      );
    } else {
      setBanners((previous) => [
        ...previous,
        { id: Date.now(), ...bannerData },
      ]);
    }

    setModalType(null);
    setEditingItem(null);
    setOriginalForm(null);
    setImageError("");
  };

  const handleContentSubmit = (event) => {
    event.preventDefault();

    const title = contentForm.title.trim();
    const content = contentForm.content.trim();

    if (!title || !content) {
      window.alert("Please enter both content title and content.");
      return;
    }

    const duplicate = contentItems.some(
      (item) =>
        item.id !== editingItem?.id &&
        item.title.trim().toLowerCase() === title.toLowerCase()
    );

    if (duplicate) {
      window.alert(
        "Website content with this title already exists."
      );
      return;
    }

    const contentData = {
      ...contentForm,
      title,
      content,
    };

    if (editingItem) {
      setContentItems((previous) =>
        previous.map((item) =>
          item.id === editingItem.id
            ? { ...item, ...contentData }
            : item
        )
      );
    } else {
      setContentItems((previous) => [
        ...previous,
        {
          id: Date.now(),
          type: "custom",
          ...contentData,
        },
      ]);
    }

    setModalType(null);
    setEditingItem(null);
    setOriginalForm(null);
  };

  const toggleStatus = (collection, setter, id, getLabel) => {
    const item = collection.find((entry) => entry.id === id);

    if (!item) return;

    const nextStatus =
      item.status === "active" ? "inactive" : "active";

    if (
      !window.confirm(
        `Are you sure you want to ${
          nextStatus === "active" ? "activate" : "deactivate"
        } "${getLabel(item)}"?`
      )
    ) {
      return;
    }

    setter((previous) =>
      previous.map((entry) =>
        entry.id === id
          ? { ...entry, status: nextStatus }
          : entry
      )
    );
  };

  const deleteItem = (collection, setter, id, getLabel, noun) => {
    const item = collection.find((entry) => entry.id === id);

    if (!item) return;

    if (
      !window.confirm(
        `Delete ${noun} "${getLabel(item)}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setter((previous) =>
      previous.filter((entry) => entry.id !== id)
    );
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const validFiles = files.filter((file) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      setImageError("Only JPG, PNG, WEBP and GIF images are allowed.");
    } else {
      setImageError("");
    }
    if (validFiles.length === 0) return;

    const formData = new FormData();
    validFiles.slice(0, 10).forEach((file) => formData.append("images", file));

    try {
      const result = await cmsRequest(`${CMS_API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadedImages = (result.images || []).map((image) => image.url).filter(Boolean);

      setBannerForm((previous) => ({
        ...previous,
        images: [...previous.images, ...uploadedImages],
      }));
      setImageError("");
    } catch (error) {
      console.error("Banner image upload error:", error);
      setImageError(error.message || "Unable to upload selected images. Please try again.");
    }
  };

  const removeBannerImage = (index) => {
    setBannerForm((previous) => ({
      ...previous,
      images: previous.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));

    setImageError("");
  };

  const renderStatus = (status) => (
    <span className={`cms-status ${status}`}>
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );

  const renderStatusToggle = (item, onToggle) => (
    <button
      type="button"
      className="cms-status-toggle"
      onClick={onToggle}
      title={`Change status for ${item.name || item.title}`}
    >
      {item.status === "active" ? (
        <ToggleRight size={24} />
      ) : (
        <ToggleLeft size={24} />
      )}

      {renderStatus(item.status)}
    </button>
  );

  return (
    <div className="admin-cms-page">
      <div className="cms-container">
        <header className="cms-header">
          <div className="cms-title-wrapper">
            <div className="cms-title-icon">
              <FileText size={25} />
            </div>

            <div>
              <h1>Website CMS</h1>
              <p>
                Manage website sections, banners and content from one
                place.
              </p>
            </div>
          </div>

          <div className="cms-header-actions">
            {activeTab === "sections" && (
              <button
                type="button"
                className="cms-primary-button"
                onClick={() => openSectionModal()}
              >
                <Plus size={18} />
                Add Section
              </button>
            )}

            {activeTab === "banners" && (
              <button
                type="button"
                className="cms-primary-button"
                onClick={() => openBannerModal()}
              >
                <Plus size={18} />
                Add Banner
              </button>
            )}

            {activeTab === "content" && (
              <button
                type="button"
                className="cms-primary-button"
                onClick={() => openContentModal()}
              >
                <Plus size={18} />
                Add Content
              </button>
            )}

            {activeTab === "faqs" && (
              <button
                type="button"
                className="cms-primary-button"
                onClick={() => openFAQModal()}
              >
                <Plus size={18} />
                Add FAQ
              </button>
            )}
          </div>
        </header>

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
              <ImageIcon size={22} />
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
              type="button"
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
              type="button"
              className={activeTab === "banners" ? "active" : ""}
              onClick={() => {
                setActiveTab("banners");
                setSearchTerm("");
              }}
            >
              <ImageIcon size={18} />
              Banners
            </button>

            <button
              type="button"
              className={activeTab === "content" ? "active" : ""}
              onClick={() => {
                setActiveTab("content");
                setSearchTerm("");
              }}
            >
              <FileText size={18} />
              Website Content
            </button>

            <button
              type="button"
              className={activeTab === "faqs" ? "active" : ""}
              onClick={() => {
                setActiveTab("faqs");
                setSearchTerm("");
              }}
            >
              <FileText size={18} />
              FAQs
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
                    : activeTab === "faqs"
                      ? "Search FAQs..."
                      : "Search content..."
              }
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="cms-toolbar-info">
            <Settings2 size={17} />
            {cmsSaving ? "Saving changes..." : cmsLoaded ? "Changes save automatically" : "Loading CMS..."}
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
                    filteredSections.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="cms-name-cell">
                            <div className="cms-row-icon">
                              <Layout size={18} />
                            </div>
                            <strong>{item.name}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="cms-description">
                            {item.description}
                          </span>
                        </td>

                        <td>
                          {renderStatusToggle(item, () =>
                            toggleStatus(
                              sections,
                              setSections,
                              item.id,
                              (entry) => entry.name
                            )
                          )}
                        </td>

                        <td>
                          <div className="cms-action-buttons">
                            <button
                              type="button"
                              className="cms-icon-button edit"
                              title="Edit"
                              onClick={() => openSectionModal(item)}
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              type="button"
                              className="cms-icon-button delete"
                              title="Delete"
                              onClick={() =>
                                deleteItem(
                                  sections,
                                  setSections,
                                  item.id,
                                  (entry) => entry.name,
                                  "section"
                                )
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
                    filteredBanners.map((item) => {
                      const images = getBannerImages(item);

                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="cms-name-cell">
                              <div className="cms-banner-thumb">
                                {images[0] ? (
                                  <img
                                    src={images[0]}
                                    alt={item.title}
                                  />
                                ) : (
                                  <ImageIcon size={20} />
                                )}
                              </div>

                              <div>
                                <strong>{item.title}</strong>
                                <small>
                                  {images.length} image(s)
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="cms-description">
                              {item.subtitle}
                            </span>
                          </td>

                          <td>
                            <span className="cms-button-preview">
                              {item.buttonText || "No button"}
                            </span>
                          </td>

                          <td>
                            {renderStatusToggle(item, () =>
                              toggleStatus(
                                banners,
                                setBanners,
                                item.id,
                                (entry) => entry.title
                              )
                            )}
                          </td>

                          <td>
                            <div className="cms-action-buttons">
                              <button
                                type="button"
                                className="cms-icon-button view"
                                title="Preview"
                                onClick={() => setViewingBanner(item)}
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                type="button"
                                className="cms-icon-button edit"
                                title="Edit"
                                onClick={() => openBannerModal(item)}
                              >
                                <Edit size={17} />
                              </button>

                              <button
                                type="button"
                                className="cms-icon-button delete"
                                title="Delete"
                                onClick={() =>
                                  deleteItem(
                                    banners,
                                    setBanners,
                                    item.id,
                                    (entry) => entry.title,
                                    "banner"
                                  )
                                }
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
                          {renderStatusToggle(item, () =>
                            toggleStatus(
                              contentItems,
                              setContentItems,
                              item.id,
                              (entry) => entry.title
                            )
                          )}
                        </td>

                        <td>
                          <div className="cms-action-buttons">
                            <button
                              type="button"
                              className="cms-icon-button edit"
                              title="Edit"
                              onClick={() => openContentModal(item)}
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              type="button"
                              className="cms-icon-button delete"
                              title="Delete"
                              onClick={() =>
                                deleteItem(
                                  contentItems,
                                  setContentItems,
                                  item.id,
                                  (entry) => entry.title,
                                  "website content"
                                )
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

        {activeTab === "faqs" && (
          <div className="cms-table-card">
            <div className="cms-table-header">
              <div>
                <h2>Frequently Asked Questions</h2>
                <p>Manage the questions and answers displayed on the public FAQ page.</p>
              </div>
            </div>

            <div className="cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((item) => (
                      <tr key={item.id}>
                        <td>{item.order || "—"}</td>
                        <td>
                          <div className="cms-name-cell">
                            <div className="cms-row-icon"><FileText size={18} /></div>
                            <strong>{item.title}</strong>
                          </div>
                        </td>
                        <td><span className="cms-content-preview">{item.content}</span></td>
                        <td>
                          {renderStatusToggle(item, () =>
                            toggleStatus(contentItems, setContentItems, item.id, (entry) => entry.title)
                          )}
                        </td>
                        <td>
                          <div className="cms-action-buttons">
                            <button type="button" className="cms-icon-button edit" title="Edit FAQ" onClick={() => openFAQModal(item)}>
                              <Edit size={17} />
                            </button>
                            <button type="button" className="cms-icon-button delete" title="Delete FAQ" onClick={() => deleteItem(contentItems, setContentItems, item.id, (entry) => entry.title, "FAQ")}>
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5"><div className="cms-empty-state">No FAQs found. Add your first FAQ.</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalType === "faq" && (
        <div className="cms-modal-overlay" onClick={closeModal}>
          <div className="cms-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cms-modal-header">
              <div>
                <h2>{editingItem ? "Edit FAQ" : "Add FAQ"}</h2>
                <p>Add the question and answer shown on the public FAQ page.</p>
              </div>
              <button type="button" className="cms-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFAQSubmit}>
              <div className="cms-form-group">
                <label htmlFor="cms-faq-question">Question</label>
                <input
                  id="cms-faq-question"
                  value={faqForm.title}
                  onChange={(event) => setFaqForm({ ...faqForm, title: event.target.value })}
                  placeholder="Enter FAQ question"
                  required
                />
              </div>
              <div className="cms-form-group">
                <label htmlFor="cms-faq-answer">Answer</label>
                <textarea
                  id="cms-faq-answer"
                  value={faqForm.content}
                  onChange={(event) => setFaqForm({ ...faqForm, content: event.target.value })}
                  placeholder="Enter FAQ answer"
                  rows={6}
                  required
                />
              </div>
              <div className="cms-form-row">
                <div className="cms-form-group">
                  <label htmlFor="cms-faq-order">Display Order</label>
                  <input
                    id="cms-faq-order"
                    type="number"
                    min="1"
                    step="1"
                    value={faqForm.order}
                    onChange={(event) => setFaqForm({ ...faqForm, order: event.target.value })}
                    required
                  />
                </div>
                <div className="cms-form-group">
                  <label htmlFor="cms-faq-status">Status</label>
                  <select
                    id="cms-faq-status"
                    value={faqForm.status}
                    onChange={(event) => setFaqForm({ ...faqForm, status: event.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="cms-modal-footer">
                <button type="button" className="cms-secondary-button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="cms-primary-button">{editingItem ? "Update FAQ" : "Add FAQ"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                type="button"
                className="cms-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSectionSubmit}>
              <div className="cms-form-group">
                <label htmlFor="cms-section-name">Section Name</label>
                <input
                  id="cms-section-name"
                  value={sectionForm.name}
                  onChange={(event) =>
                    setSectionForm({
                      ...sectionForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter section name"
                  required
                />
              </div>

              <div className="cms-form-group">
                <label htmlFor="cms-section-description">
                  Description
                </label>
                <textarea
                  id="cms-section-description"
                  value={sectionForm.description}
                  onChange={(event) =>
                    setSectionForm({
                      ...sectionForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Enter section description"
                  rows={4}
                />
              </div>

              <div className="cms-form-group">
                <label htmlFor="cms-section-status">Status</label>
                <select
                  id="cms-section-status"
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
                <p>Configure banner content and images.</p>
              </div>

              <button
                type="button"
                className="cms-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit}>
              <div className="cms-form-group">
                <label>Banner Images</label>

                <div className="cms-upload-box">
                  <Upload size={28} />
                  <strong>
                    Upload one or multiple banner images
                  </strong>
                  <span>
                    Select one or multiple image files from your computer.
                  </span>

                  <label className="cms-upload-button">
                    Choose Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                <p className="cms-image-help">
                  {bannerForm.images.length} image(s) selected
                </p>

                {imageError && (
                  <p className="cms-image-error" role="alert">
                    {imageError}
                  </p>
                )}

                {bannerForm.images.length > 0 && (
                  <div className="cms-multiple-image-grid">
                    {bannerForm.images.map((src, index) => (
                      <div
                        className="cms-multiple-image-item"
                        key={`${index}-${src.slice(0, 24)}`}
                      >
                        <img
                          src={src}
                          alt={`Banner image ${index + 1}`}
                        />

                        <span>Image {index + 1}</span>

                        <button
                          type="button"
                          onClick={() => removeBannerImage(index)}
                          title="Remove image"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cms-form-group">
                <label htmlFor="cms-banner-title">Banner Title</label>
                <input
                  id="cms-banner-title"
                  value={bannerForm.title}
                  onChange={(event) =>
                    setBannerForm({
                      ...bannerForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div className="cms-form-group">
                <label htmlFor="cms-banner-subtitle">Subtitle</label>
                <textarea
                  id="cms-banner-subtitle"
                  value={bannerForm.subtitle}
                  onChange={(event) =>
                    setBannerForm({
                      ...bannerForm,
                      subtitle: event.target.value,
                    })
                  }
                  placeholder="Enter banner subtitle"
                  rows={3}
                />
              </div>

              <div className="cms-form-row">
                <div className="cms-form-group">
                  <label htmlFor="cms-banner-button">Button Text</label>
                  <input
                    id="cms-banner-button"
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
                  <label htmlFor="cms-banner-status">Status</label>
                  <select
                    id="cms-banner-status"
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
                type="button"
                className="cms-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleContentSubmit}>
              <div className="cms-form-group">
                <label htmlFor="cms-content-title">
                  Content Title
                </label>
                <input
                  id="cms-content-title"
                  value={contentForm.title}
                  onChange={(event) =>
                    setContentForm({
                      ...contentForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="Enter content title"
                  required
                />
              </div>

              <div className="cms-form-group">
                <label htmlFor="cms-content-text">Content</label>
                <textarea
                  id="cms-content-text"
                  value={contentForm.content}
                  onChange={(event) =>
                    setContentForm({
                      ...contentForm,
                      content: event.target.value,
                    })
                  }
                  placeholder="Enter website content"
                  rows={7}
                  required
                />
              </div>

              <div className="cms-form-group">
                <label htmlFor="cms-content-status">Status</label>
                <select
                  id="cms-content-status"
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

      {viewingBanner && (
        <div
          className="cms-modal-overlay"
          onClick={() => setViewingBanner(null)}
        >
          <div
            className="cms-modal cms-banner-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cms-modal-header">
              <div>
                <h2>Banner Preview</h2>
                <p>Preview the selected banner details.</p>
              </div>

              <button
                type="button"
                className="cms-modal-close"
                onClick={() => setViewingBanner(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="cms-banner-preview-content">
              <div className="cms-preview-image-grid">
                {getBannerImages(viewingBanner).map((src, index) => (
                  <img
                    key={`${index}-${src.slice(0, 24)}`}
                    src={src}
                    alt={`${viewingBanner.title} ${index + 1}`}
                  />
                ))}
              </div>

              <h3>{viewingBanner.title}</h3>
              <p>{viewingBanner.subtitle}</p>
              <p>
                Button: {viewingBanner.buttonText || "No button text"}
              </p>
              <p>Status: {viewingBanner.status}</p>
            </div>

            <div className="cms-modal-footer cms-preview-footer">
              <button
                type="button"
                className="cms-secondary-button"
                onClick={() => setViewingBanner(null)}
              >
                Close Preview
              </button>

              <button
                type="button"
                className="cms-primary-button"
                onClick={() => {
                  const item = viewingBanner;
                  setViewingBanner(null);
                  openBannerModal(item);
                }}
              >
                <Edit size={16} />
                Edit Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCMS;
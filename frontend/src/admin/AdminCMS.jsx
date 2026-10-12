import { useMemo, useState } from "react";
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

const initialSections = [
  { id: 1, name: "Hero Banner", description: "Main banner displayed at the top of the homepage.", status: "active" },
  { id: 2, name: "Featured Categories", description: "Display selected grocery categories on the homepage.", status: "active" },
  { id: 3, name: "Featured Products", description: "Display selected products on the homepage.", status: "active" },
  { id: 4, name: "Deal of the Day", description: "Highlight special daily offers and discounted products.", status: "active" },
  { id: 5, name: "Promotional Banner", description: "Display promotional campaigns and seasonal offers.", status: "active" },
  { id: 6, name: "Newsletter", description: "Newsletter subscription section for customers.", status: "inactive" },
];

const initialBanners = [
  { id: 1, title: "Fresh Groceries Delivered", subtitle: "Fresh products delivered to your doorstep.", buttonText: "Shop Now", status: "active", images: [], image: "" },
  { id: 2, title: "Fresh Fruits & Vegetables", subtitle: "Healthy and fresh products for your family.", buttonText: "Explore Now", status: "active", images: [], image: "" },
  { id: 3, title: "Weekend Special Offers", subtitle: "Save more on your favourite grocery products.", buttonText: "View Offers", status: "inactive", images: [], image: "" },
];

const initialContent = [
  { id: 1, type: "about", title: "About Us", content: "We provide fresh and quality grocery products with convenient doorstep delivery.", status: "active" },
  { id: 2, type: "contact", title: "Contact Information", content: "Email: support@grocery.com | Phone: +91 98765 43210 | Mon-Sat: 9:00 AM - 7:00 PM", status: "active" },
  { id: 3, type: "footer", title: "Footer Content", content: "Your trusted online grocery platform for fresh products and convenient shopping.", status: "active" },
];

const emptySectionForm = { name: "", description: "", status: "active" };
const emptyBannerForm = { title: "", subtitle: "", buttonText: "", status: "active", images: [] };
const emptyContentForm = { title: "", content: "", status: "active" };
const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const getBannerImages = (banner) => {
  if (Array.isArray(banner.images) && banner.images.length) return banner.images.filter(Boolean);
  return banner.image ? [banner.image] : [];
};

const readImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

function AdminCMS() {
  const [activeTab, setActiveTab] = useState("sections");
  const [searchTerm, setSearchTerm] = useState("");
  const [sections, setSections] = useState(initialSections);
  const [banners, setBanners] = useState(initialBanners);
  const [contentItems, setContentItems] = useState(initialContent);
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingBanner, setViewingBanner] = useState(null);
  const [sectionForm, setSectionForm] = useState({ ...emptySectionForm });
  const [bannerForm, setBannerForm] = useState({ ...emptyBannerForm });
  const [contentForm, setContentForm] = useState({ ...emptyContentForm });
  const [originalForm, setOriginalForm] = useState(null);
  const [imageError, setImageError] = useState("");

  const filteredSections = useMemo(() => sections.filter((item) =>
    `${item.name} ${item.description}`.toLowerCase().includes(searchTerm.toLowerCase().trim())
  ), [sections, searchTerm]);

  const filteredBanners = useMemo(() => banners.filter((item) =>
    `${item.title} ${item.subtitle}`.toLowerCase().includes(searchTerm.toLowerCase().trim())
  ), [banners, searchTerm]);

  const filteredContent = useMemo(() => contentItems.filter((item) =>
    `${item.title} ${item.content}`.toLowerCase().includes(searchTerm.toLowerCase().trim())
  ), [contentItems, searchTerm]);

  const totalSections = sections.length;
  const activeSections = sections.filter((item) => item.status === "active").length;
  const totalBanners = banners.length;
  const activeContent = contentItems.filter((item) => item.status === "active").length;

  const getCurrentForm = () => {
    if (modalType === "section") return sectionForm;
    if (modalType === "banner") return bannerForm;
    if (modalType === "content") return contentForm;
    return null;
  };

  const hasUnsavedChanges = () => {
    const current = getCurrentForm();
    return Boolean(current && originalForm && JSON.stringify(current) !== JSON.stringify(originalForm));
  };

  const closeModal = () => {
    if (hasUnsavedChanges() && !window.confirm("You have unsaved changes. Discard them and close this form?")) return;
    setModalType(null);
    setEditingItem(null);
    setOriginalForm(null);
    setImageError("");
  };

  const openSectionModal = (item = null) => {
    if (modalType && hasUnsavedChanges() && !window.confirm("Discard the current unsaved changes and open another form?")) return;
    const confirmed = window.confirm(item ? `Do you want to edit the section "${item.name}"?` : "Do you want to add a new homepage section?");
    if (!confirmed) return;
    const form = item ? { name: item.name, description: item.description, status: item.status } : { ...emptySectionForm };
    setEditingItem(item);
    setSectionForm(form);
    setOriginalForm({ ...form });
    setModalType("section");
    setImageError("");
  };

  const openBannerModal = (item = null) => {
    if (modalType && hasUnsavedChanges() && !window.confirm("Discard the current unsaved changes and open another form?")) return;
    const confirmed = window.confirm(item ? `Do you want to edit the banner "${item.title}"?` : "Do you want to add a new banner?");
    if (!confirmed) return;
    const form = item
      ? { title: item.title, subtitle: item.subtitle, buttonText: item.buttonText, status: item.status, images: getBannerImages(item) }
      : { ...emptyBannerForm, images: [] };
    setEditingItem(item);
    setBannerForm(form);
    setOriginalForm(JSON.parse(JSON.stringify(form)));
    setModalType("banner");
    setImageError("");
  };

  const openContentModal = (item = null) => {
    if (modalType && hasUnsavedChanges() && !window.confirm("Discard the current unsaved changes and open another form?")) return;
    const confirmed = window.confirm(item ? `Do you want to edit "${item.title}"?` : "Do you want to add new website content?");
    if (!confirmed) return;
    const form = item ? { title: item.title, content: item.content, status: item.status } : { ...emptyContentForm };
    setEditingItem(item);
    setContentForm(form);
    setOriginalForm({ ...form });
    setModalType("content");
  };

  const handleSectionSubmit = (event) => {
    event.preventDefault();
    const name = sectionForm.name.trim();
    if (!name) return window.alert("Please enter section name.");
    const duplicate = sections.some((item) => item.id !== editingItem?.id && item.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) return window.alert("A section with this name already exists.");
    if (!window.confirm(editingItem ? `Save changes to "${name}"?` : `Create the section "${name}"?`)) return;

    if (editingItem) {
      setSections((prev) => prev.map((item) => item.id === editingItem.id ? { ...item, ...sectionForm, name, description: sectionForm.description.trim() } : item));
      window.alert("Section updated successfully.");
    } else {
      setSections((prev) => [...prev, { id: Date.now(), ...sectionForm, name, description: sectionForm.description.trim() }]);
      window.alert("Section added successfully.");
    }
    setModalType(null); setEditingItem(null); setOriginalForm(null);
  };

  const handleBannerSubmit = (event) => {
    event.preventDefault();
    const title = bannerForm.title.trim();
    if (!title) return window.alert("Please enter banner title.");
    if (bannerForm.images.length > MAX_IMAGES) return window.alert(`A banner can contain a maximum of ${MAX_IMAGES} images.`);
    const duplicate = banners.some((item) => item.id !== editingItem?.id && item.title.trim().toLowerCase() === title.toLowerCase());
    if (duplicate) return window.alert("A banner with this title already exists.");
    if (!window.confirm(editingItem ? `Save changes to banner "${title}"?` : `Create the banner "${title}"?`)) return;

    const images = [...bannerForm.images];
    const bannerData = { ...bannerForm, title, images, image: images[0] || "" };
    if (editingItem) {
      setBanners((prev) => prev.map((item) => item.id === editingItem.id ? { ...item, ...bannerData } : item));
      window.alert("Banner updated successfully.");
    } else {
      setBanners((prev) => [...prev, { id: Date.now(), ...bannerData }]);
      window.alert("Banner added successfully.");
    }
    setModalType(null); setEditingItem(null); setOriginalForm(null); setImageError("");
  };

  const handleContentSubmit = (event) => {
    event.preventDefault();
    const title = contentForm.title.trim();
    const content = contentForm.content.trim();
    if (!title) return window.alert("Please enter content title.");
    if (!content) return window.alert("Please enter content.");
    const duplicate = contentItems.some((item) => item.id !== editingItem?.id && item.title.trim().toLowerCase() === title.toLowerCase());
    if (duplicate) return window.alert("Website content with this title already exists.");
    if (!window.confirm(editingItem ? `Save changes to "${title}"?` : `Create the website content "${title}"?`)) return;

    if (editingItem) {
      setContentItems((prev) => prev.map((item) => item.id === editingItem.id ? { ...item, ...contentForm, title, content } : item));
      window.alert("Website content updated successfully.");
    } else {
      setContentItems((prev) => [...prev, { id: Date.now(), type: "custom", ...contentForm, title, content }]);
      window.alert("Website content added successfully.");
    }
    setModalType(null); setEditingItem(null); setOriginalForm(null);
  };

  const toggleStatus = (collection, setter, id, label) => {
    const item = collection.find((entry) => entry.id === id);
    if (!item) return;
    const nextStatus = item.status === "active" ? "inactive" : "active";
    if (!window.confirm(`Are you sure you want to ${nextStatus === "active" ? "activate" : "deactivate"} "${label(item)}"?`)) return;
    setter((prev) => prev.map((entry) => entry.id === id ? { ...entry, status: nextStatus } : entry));
  };

  const deleteItem = (collection, setter, id, label, noun) => {
    const item = collection.find((entry) => entry.id === id);
    if (!item) return;
    if (!window.confirm(`Delete ${noun} "${label(item)}"? This action cannot be undone.`)) return;
    setter((prev) => prev.filter((entry) => entry.id !== id));
    window.alert(`${noun.charAt(0).toUpperCase() + noun.slice(1)} deleted successfully.`);
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const remaining = MAX_IMAGES - bannerForm.images.length;
    if (remaining <= 0) {
      setImageError(`A banner can contain a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const candidates = files.slice(0, remaining);
    const validFiles = [];
    const errors = [];

    if (files.length > remaining) errors.push(`Only ${remaining} additional image(s) can be added.`);
    candidates.forEach((file) => {
      if (!file.type.startsWith("image/")) errors.push(`${file.name}: select a valid image file.`);
      else if (file.size > MAX_IMAGE_SIZE) errors.push(`${file.name}: image must not exceed 5 MB.`);
      else validFiles.push(file);
    });

    if (errors.length) setImageError(errors.join(" "));
    else setImageError("");
    if (!validFiles.length) return;

    if (!window.confirm(`Add ${validFiles.length} image(s) to this banner?`)) return;

    try {
      const imageData = await Promise.all(validFiles.map(async (file) => ({
        name: file.name,
        src: await readImage(file),
      })));
      setBannerForm((prev) => ({
        ...prev,
        images: [...prev.images, ...imageData.map((item) => item.src)].slice(0, MAX_IMAGES),
      }));
      setImageError("");
    } catch (error) {
      console.error("Banner image upload error:", error);
      setImageError("Unable to preview the selected image(s). Please try again.");
    }
  };

  const removeBannerImage = (index) => {
    if (!window.confirm("Remove this banner image? Save the form to confirm the change.")) return;
    setBannerForm((prev) => ({ ...prev, images: prev.images.filter((_, imageIndex) => imageIndex !== index) }));
    setImageError("");
  };

  const renderStatus = (status) => (
    <span className={`cms-status ${status}`}>{status === "active" ? "Active" : "Inactive"}</span>
  );

  const renderStatusToggle = (item, onToggle) => (
    <button type="button" className="cms-status-toggle" onClick={onToggle} title={`Change status for ${item.name || item.title}`}>
      {item.status === "active" ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
      {renderStatus(item.status)}
    </button>
  );

  return (
    <div className="admin-cms-page">
      <div className="cms-container">
        <div className="cms-header">
          <div className="cms-title-wrapper">
            <div className="cms-title-icon"><FileText size={25} /></div>
            <div>
              <h1>Website CMS</h1>
              <p>Manage website sections, banners and content from one place.</p>
            </div>
          </div>
          <div className="cms-header-actions">
            {activeTab === "sections" && <button type="button" className="cms-primary-button" onClick={() => openSectionModal()}><Plus size={18} />Add Section</button>}
            {activeTab === "banners" && <button type="button" className="cms-primary-button" onClick={() => openBannerModal()}><Plus size={18} />Add Banner</button>}
            {activeTab === "content" && <button type="button" className="cms-primary-button" onClick={() => openContentModal()}><Plus size={18} />Add Content</button>}
          </div>
        </div>

        <div className="cms-stats-grid">
          <div className="cms-stat-card"><div className="cms-stat-icon"><Layout size={22} /></div><div><span>Total Sections</span><strong>{totalSections}</strong></div></div>
          <div className="cms-stat-card"><div className="cms-stat-icon"><ToggleRight size={22} /></div><div><span>Active Sections</span><strong>{activeSections}</strong></div></div>
          <div className="cms-stat-card"><div className="cms-stat-icon"><ImageIcon size={22} /></div><div><span>Total Banners</span><strong>{totalBanners}</strong></div></div>
          <div className="cms-stat-card"><div className="cms-stat-icon"><FileText size={22} /></div><div><span>Active Content</span><strong>{activeContent}</strong></div></div>
        </div>

        <div className="cms-tabs-card">
          <div className="cms-tabs">
            <button type="button" className={activeTab === "sections" ? "active" : ""} onClick={() => { setActiveTab("sections"); setSearchTerm(""); }}><Layout size={18} />Home Sections</button>
            <button type="button" className={activeTab === "banners" ? "active" : ""} onClick={() => { setActiveTab("banners"); setSearchTerm(""); }}><ImageIcon size={18} />Banners</button>
            <button type="button" className={activeTab === "content" ? "active" : ""} onClick={() => { setActiveTab("content"); setSearchTerm(""); }}><FileText size={18} />Website Content</button>
          </div>
        </div>

        <div className="cms-toolbar">
          <div className="cms-search"><Search size={18} /><input type="text" placeholder={activeTab === "sections" ? "Search sections..." : activeTab === "banners" ? "Search banners..." : "Search content..."} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
          <div className="cms-toolbar-info"><Settings2 size={17} />Frontend Preview Mode</div>
        </div>

        {activeTab === "sections" && (
          <div className="cms-table-card">
            <div className="cms-table-header"><div><h2>Homepage Sections</h2><p>Control which sections appear on the public homepage.</p></div></div>
            <div className="cms-table-wrapper"><table className="cms-table">
              <thead><tr><th>Section</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filteredSections.length ? filteredSections.map((item) => (
                <tr key={item.id}>
                  <td><div className="cms-name-cell"><div className="cms-row-icon"><Layout size={18} /></div><strong>{item.name}</strong></div></td>
                  <td><span className="cms-description">{item.description}</span></td>
                  <td>{renderStatusToggle(item, () => toggleStatus(sections, setSections, item.id, (entry) => entry.name))}</td>
                  <td><div className="cms-action-buttons"><button type="button" className="cms-icon-button edit" title="Edit" onClick={() => openSectionModal(item)}><Edit size={17} /></button><button type="button" className="cms-icon-button delete" title="Delete" onClick={() => deleteItem(sections, setSections, item.id, (entry) => entry.name, "section")}><Trash2 size={17} /></button></div></td>
                </tr>
              )) : <tr><td colSpan="4"><div className="cms-empty-state">No sections found.</div></td></tr>}</tbody>
            </table></div>
          </div>
        )}

        {activeTab === "banners" && (
          <div className="cms-table-card">
            <div className="cms-table-header"><div><h2>Website Banners</h2><p>Manage promotional and homepage banner content.</p></div></div>
            <div className="cms-table-wrapper"><table className="cms-table">
              <thead><tr><th>Banner</th><th>Subtitle</th><th>Button</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filteredBanners.length ? filteredBanners.map((item) => {
                const images = getBannerImages(item);
                return <tr key={item.id}>
                  <td><div className="cms-name-cell"><div className="cms-banner-thumb">{images[0] ? <img src={images[0]} alt={item.title} /> : <ImageIcon size={20} />}</div><div><strong>{item.title}</strong><small className="cms-image-count">{images.length} image(s)</small></div></div></td>
                  <td><span className="cms-description">{item.subtitle}</span></td>
                  <td><span className="cms-button-preview">{item.buttonText || "No button"}</span></td>
                  <td>{renderStatusToggle(item, () => toggleStatus(banners, setBanners, item.id, (entry) => entry.title))}</td>
                  <td><div className="cms-action-buttons"><button type="button" className="cms-icon-button view" title="Preview" onClick={() => { if (window.confirm(`Preview banner "${item.title}"?`)) setViewingBanner(item); }}><Eye size={17} /></button><button type="button" className="cms-icon-button edit" title="Edit" onClick={() => openBannerModal(item)}><Edit size={17} /></button><button type="button" className="cms-icon-button delete" title="Delete" onClick={() => deleteItem(banners, setBanners, item.id, (entry) => entry.title, "banner")}><Trash2 size={17} /></button></div></td>
                </tr>;
              }) : <tr><td colSpan="5"><div className="cms-empty-state">No banners found.</div></td></tr>}</tbody>
            </table></div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="cms-table-card">
            <div className="cms-table-header"><div><h2>Website Content</h2><p>Manage general website information and footer content.</p></div></div>
            <div className="cms-table-wrapper"><table className="cms-table">
              <thead><tr><th>Content</th><th>Details</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{filteredContent.length ? filteredContent.map((item) => (
                <tr key={item.id}>
                  <td><div className="cms-name-cell"><div className="cms-row-icon"><FileText size={18} /></div><strong>{item.title}</strong></div></td>
                  <td><span className="cms-content-preview">{item.content}</span></td>
                  <td>{renderStatusToggle(item, () => toggleStatus(contentItems, setContentItems, item.id, (entry) => entry.title))}</td>
                  <td><div className="cms-action-buttons"><button type="button" className="cms-icon-button edit" title="Edit" onClick={() => openContentModal(item)}><Edit size={17} /></button><button type="button" className="cms-icon-button delete" title="Delete" onClick={() => deleteItem(contentItems, setContentItems, item.id, (entry) => entry.title, "website content")}><Trash2 size={17} /></button></div></td>
                </tr>
              )) : <tr><td colSpan="4"><div className="cms-empty-state">No content found.</div></td></tr>}</tbody>
            </table></div>
          </div>
        )}
      </div>

      {modalType === "section" && (
        <div className="cms-modal-overlay" onClick={closeModal}>
          <div className="cms-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cms-modal-header"><div><h2>{editingItem ? "Edit Section" : "Add Section"}</h2><p>Configure homepage section details.</p></div><button type="button" className="cms-modal-close" onClick={closeModal}><X size={20} /></button></div>
            <form onSubmit={handleSectionSubmit}>
              <div className="cms-form-group"><label htmlFor="cms-section-name">Section Name</label><input id="cms-section-name" value={sectionForm.name} onChange={(event) => setSectionForm({ ...sectionForm, name: event.target.value })} placeholder="Enter section name" required /></div>
              <div className="cms-form-group"><label htmlFor="cms-section-description">Description</label><textarea id="cms-section-description" value={sectionForm.description} onChange={(event) => setSectionForm({ ...sectionForm, description: event.target.value })} placeholder="Enter section description" rows={4} /></div>
              <div className="cms-form-group"><label htmlFor="cms-section-status">Status</label><select id="cms-section-status" value={sectionForm.status} onChange={(event) => setSectionForm({ ...sectionForm, status: event.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div className="cms-modal-footer"><button type="button" className="cms-secondary-button" onClick={closeModal}>Cancel</button><button type="submit" className="cms-primary-button">{editingItem ? "Update Section" : "Add Section"}</button></div>
            </form>
          </div>
        </div>
      )}

      {modalType === "banner" && (
        <div className="cms-modal-overlay" onClick={closeModal}>
          <div className="cms-modal cms-banner-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cms-modal-header"><div><h2>{editingItem ? "Edit Banner" : "Add Banner"}</h2><p>Configure banner content and images.</p></div><button type="button" className="cms-modal-close" onClick={closeModal}><X size={20} /></button></div>
            <form onSubmit={handleBannerSubmit}>
              <div className="cms-form-group">
                <label>Banner Images (up to {MAX_IMAGES})</label>
                <div className="cms-upload-box">
                  <Upload size={28} />
                  <strong>Upload one or multiple banner images</strong>
                  <span>Image files only · Maximum 5 MB per image</span>
                  <label className="cms-upload-button">Choose Images<input type="file" accept="image/*" multiple onChange={handleImageUpload} /></label>
                </div>
                <p className="cms-image-help">{bannerForm.images.length} of {MAX_IMAGES} images selected</p>
                {imageError && <p className="cms-image-error" role="alert">{imageError}</p>}
                {bannerForm.images.length > 0 && <div className="cms-multiple-image-grid">
                  {bannerForm.images.map((src, index) => <div className="cms-multiple-image-item" key={`${index}-${src.slice(0, 24)}`}>
                    <img src={src} alt={`Banner image ${index + 1}`} />
                    <span>Image {index + 1}</span>
                    <button type="button" onClick={() => removeBannerImage(index)} title="Remove image" aria-label={`Remove image ${index + 1}`}><X size={16} /></button>
                  </div>)}
                </div>}
              </div>
              <div className="cms-form-group"><label htmlFor="cms-banner-title">Banner Title</label><input id="cms-banner-title" value={bannerForm.title} onChange={(event) => setBannerForm({ ...bannerForm, title: event.target.value })} placeholder="Enter banner title" required /></div>
              <div className="cms-form-group"><label htmlFor="cms-banner-subtitle">Subtitle</label><textarea id="cms-banner-subtitle" value={bannerForm.subtitle} onChange={(event) => setBannerForm({ ...bannerForm, subtitle: event.target.value })} placeholder="Enter banner subtitle" rows={3} /></div>
              <div className="cms-form-row">
                <div className="cms-form-group"><label htmlFor="cms-banner-button">Button Text</label><input id="cms-banner-button" value={bannerForm.buttonText} onChange={(event) => setBannerForm({ ...bannerForm, buttonText: event.target.value })} placeholder="Example: Shop Now" /></div>
                <div className="cms-form-group"><label htmlFor="cms-banner-status">Status</label><select id="cms-banner-status" value={bannerForm.status} onChange={(event) => setBannerForm({ ...bannerForm, status: event.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              </div>
              <div className="cms-modal-footer"><button type="button" className="cms-secondary-button" onClick={closeModal}>Cancel</button><button type="submit" className="cms-primary-button">{editingItem ? "Update Banner" : "Add Banner"}</button></div>
            </form>
          </div>
        </div>
      )}

      {modalType === "content" && (
        <div className="cms-modal-overlay" onClick={closeModal}>
          <div className="cms-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cms-modal-header"><div><h2>{editingItem ? "Edit Content" : "Add Content"}</h2><p>Manage website information and text content.</p></div><button type="button" className="cms-modal-close" onClick={closeModal}><X size={20} /></button></div>
            <form onSubmit={handleContentSubmit}>
              <div className="cms-form-group"><label htmlFor="cms-content-title">Content Title</label><input id="cms-content-title" value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })} placeholder="Enter content title" required /></div>
              <div className="cms-form-group"><label htmlFor="cms-content-text">Content</label><textarea id="cms-content-text" value={contentForm.content} onChange={(event) => setContentForm({ ...contentForm, content: event.target.value })} placeholder="Enter website content" rows={7} required /></div>
              <div className="cms-form-group"><label htmlFor="cms-content-status">Status</label><select id="cms-content-status" value={contentForm.status} onChange={(event) => setContentForm({ ...contentForm, status: event.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div className="cms-modal-footer"><button type="button" className="cms-secondary-button" onClick={closeModal}>Cancel</button><button type="submit" className="cms-primary-button">{editingItem ? "Update Content" : "Add Content"}</button></div>
            </form>
          </div>
        </div>
      )}

      {viewingBanner && (
        <div className="cms-modal-overlay" onClick={() => setViewingBanner(null)}>
          <div className="cms-modal cms-banner-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cms-modal-header"><div><h2>Banner Preview</h2><p>Preview the selected banner details.</p></div><button type="button" className="cms-modal-close" onClick={() => setViewingBanner(null)}><X size={20} /></button></div>
            <div className="cms-banner-preview-content">
              <div className="cms-preview-image-grid">{getBannerImages(viewingBanner).map((src, index) => <img key={`${index}-${src.slice(0, 24)}`} src={src} alt={`${viewingBanner.title} ${index + 1}`} />)}</div>
              <h3>{viewingBanner.title}</h3><p>{viewingBanner.subtitle}</p><p>Button: {viewingBanner.buttonText || "No button text"}</p><p>Status: {viewingBanner.status}</p>
            </div>
            <div className="cms-modal-footer cms-preview-footer"><button type="button" className="cms-secondary-button" onClick={() => setViewingBanner(null)}>Close Preview</button><button type="button" className="cms-primary-button" onClick={() => { const item = viewingBanner; setViewingBanner(null); openBannerModal(item); }}><Edit size={16} />Edit Banner</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCMS;

import { useContext, useState, useEffect } from "react";
import { GlobalStateContext } from "../../../../context/GlobalState.context";
import { VscExtensions, VscTrash, VscAdd } from "react-icons/vsc";
import { useTranslation } from "react-i18next";

interface Extension {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
}

export const Extensions = () => {
    const { selectedTheme } = useContext(GlobalStateContext);
    const { t } = useTranslation();
    const [extensions, setExtensions] = useState<Extension[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newExtension, setNewExtension] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        const stored = localStorage.getItem("portfolio-extensions");
        if (stored) {
            setExtensions(JSON.parse(stored));
        }
    }, []);

    const saveExtensions = (exts: Extension[]) => {
        localStorage.setItem("portfolio-extensions", JSON.stringify(exts));
        setExtensions(exts);
    };

    const handleAddExtension = () => {
        if (!newExtension.name.trim()) return;

        const extension: Extension = {
            id: Date.now().toString(),
            name: newExtension.name.trim(),
            description: newExtension.description.trim(),
            enabled: true,
        };

        saveExtensions([...extensions, extension]);
        setNewExtension({ name: "", description: "" });
        setShowAddForm(false);
    };

    const handleToggleExtension = (id: string) => {
        const updated = extensions.map((ext) =>
            ext.id === id ? { ...ext, enabled: !ext.enabled } : ext,
        );
        saveExtensions(updated);
    };

    const handleRemoveExtension = (id: string) => {
        const updated = extensions.filter((ext) => ext.id !== id);
        saveExtensions(updated);
    };

    return (
        <section
            className={`w-full flex flex-col ${selectedTheme.mode} overflow-hidden`}
        >
            <header className="w-full h-10 px-3 flex items-center justify-between text-xs text-white overflow-hidden tracking-[1px]">
                <span>{t("extensions.title")}</span>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="hover:bg-primary/20 p-1 rounded transition-colors"
                    aria-label={t("extensions.add")}
                >
                    <VscAdd className="w-4 h-4" />
                </button>
            </header>

            <div className="w-full h-[calc(100%-40px)] overflow-y-auto">
                {showAddForm && (
                    <div className="p-3 border-b border-sub-gary/30">
                        <input
                            type="text"
                            placeholder={t("extensions.name")}
                            value={newExtension.name}
                            onChange={(e) =>
                                setNewExtension({
                                    ...newExtension,
                                    name: e.target.value,
                                })
                            }
                            className="w-full px-2 py-1 mb-2 text-xs bg-sub-gary/20 text-white border border-sub-gary/30 rounded focus:outline-none focus:border-primary"
                        />
                        <input
                            type="text"
                            placeholder={t("extensions.description")}
                            value={newExtension.description}
                            onChange={(e) =>
                                setNewExtension({
                                    ...newExtension,
                                    description: e.target.value,
                                })
                            }
                            className="w-full px-2 py-1 mb-2 text-xs bg-sub-gary/20 text-white border border-sub-gary/30 rounded focus:outline-none focus:border-primary"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddExtension}
                                className="flex-1 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/80 transition-colors"
                            >
                                {t("extensions.add")}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewExtension({ name: "", description: "" });
                                }}
                                className="flex-1 px-2 py-1 text-xs bg-sub-gary/20 text-white rounded hover:bg-sub-gary/30 transition-colors"
                            >
                                {t("extensions.cancel")}
                            </button>
                        </div>
                    </div>
                )}

                {extensions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 text-xs p-3">
                        <VscExtensions className="w-12 h-12 mb-2 opacity-30" />
                        <p>{t("extensions.noExtensions")}</p>
                    </div>
                ) : (
                    <ul className="w-full">
                        {extensions.map((ext) => (
                            <li
                                key={ext.id}
                                className={`w-full p-3 flex items-start gap-2 border-b border-sub-gary/30 ${ext.enabled ? "" : "opacity-50"
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <VscExtensions className="w-4 h-4 text-primary flex-shrink-0" />
                                        <h3 className="text-xs font-medium text-white truncate">
                                            {ext.name}
                                        </h3>
                                    </div>
                                    {ext.description && (
                                        <p className="text-[10px] text-white/70 line-clamp-2 ml-6">
                                            {ext.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 ml-6">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={ext.enabled}
                                                onChange={() =>
                                                    handleToggleExtension(ext.id)
                                                }
                                                className="w-3 h-3"
                                            />
                                            <span className="text-[10px] text-white/70">
                                                {ext.enabled ? t("extensions.enabled") : t("extensions.disabled")}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveExtension(ext.id)}
                                    className="hover:bg-primary/20 p-1 rounded transition-colors flex-shrink-0"
                                    aria-label={t("common.delete")}
                                >
                                    <VscTrash className="w-4 h-4 text-white/70 hover:text-white" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

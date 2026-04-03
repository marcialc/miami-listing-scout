import { useI18n } from "../i18n";

interface SaveBarProps {
  hasChanges: boolean;
  saving: boolean;
  onSave: () => void;
}

export function SaveBar({ hasChanges, saving, onSave }: SaveBarProps) {
  const { t } = useI18n();

  return (
    <div
      className={`fixed bottom-0 inset-x-0 border-t bg-white/95 backdrop-blur-sm transition-all duration-200 ${
        hasChanges ? "translate-y-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]" : "translate-y-full"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-sm text-stone-600">{t("save.unsaved")}</span>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {saving ? t("save.saving") : t("save.saveChanges")}
        </button>
      </div>
    </div>
  );
}

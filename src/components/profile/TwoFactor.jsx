import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { LuShieldCheck, LuShield } from "react-icons/lu";
import apis from "@/api/index";
import { GlassCard, Badge, Input, PrimaryButton, Modal } from "@/components";
import { useModalContext } from "@/context/ModalContext";

const TwoFactor = ({ user, onUpdated }) => {
  const enabled = Boolean(user?.twoFactor?.enabled);
  const { modal, openModal, closeModal } = useModalContext();
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");

  const close = () => {
    closeModal();
    setQrCode("");
    setCode("");
  };

  const { mutate: startSetup, isPending: settingUp } = useMutation({
    mutationFn: () => apis.twoFactorSetup(),
    onSuccess: ({ data }) => {
      setQrCode(data?.data?.qrCode || "");
      setCode("");
      openModal("enable");
    },
    onError: (err) => toast.error(err || "Couldn't start 2FA setup"),
  });

  const { mutate: enable2fa, isPending: enabling } = useMutation({
    mutationFn: () => apis.twoFactorEnable({ code }),
    onSuccess: ({ data }) => {
      toast.success(data?.message || "Two-factor authentication enabled");
      close();
      onUpdated?.();
    },
    onError: (err) => toast.error(err || "Invalid code. Please try again."),
  });

  const { mutate: disable2fa, isPending: disabling } = useMutation({
    mutationFn: () => apis.twoFactorDisable({ code }),
    onSuccess: ({ data }) => {
      toast.success(data?.message || "Two-factor authentication disabled");
      close();
      onUpdated?.();
    },
    onError: (err) => toast.error(err || "Invalid code. Please try again."),
  });

  const busy = enabling || disabling;
  const codeValid = /^\d{6}$/.test(code);

  return (
    <GlassCard className="animate-rise p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${
            enabled ? "bg-success/15 text-success" : "bg-aurora-soft text-primary"
          }`}
        >
          {enabled ? <LuShieldCheck className="text-xl" /> : <LuShield className="text-xl" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">Two-factor auth</h3>
            <Badge tone={enabled ? "approved" : "neutral"} dot>
              {enabled ? "On" : "Off"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Require a code from an authenticator app at every sign-in.
          </p>
        </div>
      </div>

      <div className="mt-5">
        {enabled ? (
          <PrimaryButton
            label="Disable 2FA"
            variant="secondary"
            className="w-full py-2.5"
            onClick={() => {
              setCode("");
              openModal("disable");
            }}
          />
        ) : (
          <PrimaryButton
            label="Enable 2FA"
            variant="primary"
            className="w-full py-2.5"
            isLoading={settingUp}
            onClick={() => startSetup()}
          />
        )}
      </div>

      <Modal
        isOpen={modal?.type === "enable" || modal?.type === "disable"}
        onClose={close}
        size="sm"
        title={modal?.type === "enable" ? "Scan to set up" : "Disable two-factor auth"}
        description={
          modal?.type === "enable"
            ? "Scan this with Google Authenticator / Authy, then enter the 6-digit code."
            : "Enter a current code from your authenticator app to turn it off."
        }
      >
        {modal?.type === "enable" && qrCode && (
          <img src={qrCode} alt="2FA QR code" className="mx-auto size-44 rounded-xl bg-white p-2" />
        )}

        <div className="mt-4">
          <Input
            id="2fa-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <PrimaryButton
            label="Cancel"
            variant="ghost"
            className="flex-1 py-2.5"
            onClick={close}
            disabled={busy}
          />
          <PrimaryButton
            label={modal?.type === "enable" ? "Verify & enable" : "Disable"}
            variant={modal?.type === "enable" ? "primary" : "danger"}
            className="flex-1 py-2.5"
            isLoading={busy}
            disabled={!codeValid}
            onClick={() => (modal?.type === "enable" ? enable2fa() : disable2fa())}
          />
        </div>
      </Modal>
    </GlassCard>
  );
};

export default TwoFactor;

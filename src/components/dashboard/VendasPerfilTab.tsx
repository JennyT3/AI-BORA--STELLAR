import React from 'react';
import { theme } from "../../styles/theme";
import { Instagram, Facebook, Linkedin, Twitter, Save, Camera } from "lucide-react";

export interface VendasPerfilTabProps {
  vendedor: any;
  profileData: any;
  editProfile: boolean;
  onProfileChange: (field: string, value: string) => void;
  onSave: () => void;
  onToggleEdit: () => void;
}

export function VendasPerfilTab({ vendedor, profileData, editProfile, onProfileChange, onSave, onToggleEdit }: VendasPerfilTabProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Meu Perfil</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Gerencia suas informações pessoais e redes sociais</p>
        </div>
        {!editProfile && (
          <button onClick={onToggleEdit} style={{ padding: "10px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            Editar Perfil
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", textAlign: "center" }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", backgroundColor: theme.colors.accent.primary, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 48, fontWeight: 900, overflow: "hidden" }}>
            {profileData.fotoPerfil ? <img src={profileData.fotoPerfil} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : profileData.nome?.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.colors.text.primary }}>{vendedor.nome}</div>
          <div style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 16 }}>Vendedor</div>
          {editProfile && (
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", color: theme.colors.accent.primary, fontSize: 13, fontWeight: 600 }}>
                <Camera size={16} /> Alterar Foto
                <input type="text" value={profileData.fotoPerfil} onChange={(e) => onProfileChange('fotoPerfil', e.target.value)} placeholder="URL da foto" style={{ display: "none" }} />
              </label>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Informações Pessoais</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Nome</label>
              {editProfile ? (
                <input value={profileData.nome} onChange={(e) => onProfileChange('nome', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
              ) : (
                <div style={{ fontSize: 14, color: theme.colors.text.primary, fontWeight: 500 }}>{vendedor.nome}</div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Email</label>
              {editProfile ? (
                <input value={profileData.email} onChange={(e) => onProfileChange('email', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
              ) : (
                <div style={{ fontSize: 14, color: theme.colors.text.primary, fontWeight: 500 }}>{vendedor.email}</div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Telefone</label>
              {editProfile ? (
                <input value={profileData.telefone} onChange={(e) => onProfileChange('telefone', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
              ) : (
                <div style={{ fontSize: 14, color: theme.colors.text.primary, fontWeight: 500 }}>{vendedor.telefone || "—"}</div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Comissão</label>
              <div style={{ fontSize: 14, color: theme.colors.accent.primary, fontWeight: 700 }}>{vendedor.comissaoPercent}%</div>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 20 }}>Redes Sociais</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Instagram size={20} color="#E1306C" />
              {editProfile ? (
                <input value={profileData.instagram} onChange={(e) => onProfileChange('instagram', e.target.value)} placeholder="@instagram" style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
              ) : (
                <span style={{ fontSize: 14, color: theme.colors.text.primary }}>{vendedor.redesSociais?.instagram || "Não vinculado"}</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Facebook size={20} color="#1877F2" />
              {editProfile ? (
                <input value={profileData.facebook} onChange={(e) => onProfileChange('facebook', e.target.value)} placeholder="Facebook" style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
              ) : (
                <span style={{ fontSize: 14, color: theme.colors.text.primary }}>{vendedor.redesSociais?.facebook || "Não vinculado"}</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Linkedin size={20} color="#0A66C2" />
              {editProfile ? (
                <input value={profileData.linkedin} onChange={(e) => onProfileChange('linkedin', e.target.value)} placeholder="LinkedIn" style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
              ) : (
                <span style={{ fontSize: 14, color: theme.colors.text.primary }}>{vendedor.redesSociais?.linkedin || "Não vinculado"}</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Twitter size={20} color="#000000" />
              {editProfile ? (
                <input value={profileData.twitter} onChange={(e) => onProfileChange('twitter', e.target.value)} placeholder="@twitter" style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
              ) : (
                <span style={{ fontSize: 14, color: theme.colors.text.primary }}>{vendedor.redesSociais?.twitter || "Não vinculado"}</span>
              )}
            </div>
          </div>

          {editProfile && (
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={onSave} style={{ padding: "12px 24px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Save size={16} /> Guardar Alterações
              </button>
              <button onClick={onToggleEdit} style={{ padding: "12px 24px", borderRadius: 10, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

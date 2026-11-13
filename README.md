# OPC Catalogue Pièces – version téléphone

Catalogue atelier hors ligne pour Opel OPC (Insignia A, Vectra C, Astra G, Astra H, Astra J, Corsa D, Corsa E, Meriva A, Zafira A, Zafira B).

**Le contenu est chiffré (AES-256)** : il ne s'ouvre qu'avec une clé de licence. Sans elle, les fichiers de ce dépôt sont illisibles.

Ouvrir https://hdbray-opc.github.io/opc-catalogue/ sur le téléphone, saisir la clé de licence, puis :
- iPhone : Safari › Partager › **Sur l'écran d'accueil**
- Android : Chrome › menu ⋮ › **Installer l'application**

La clé n'est demandée qu'une fois par appareil. Le catalogue (environ 150 Mo, gardé chiffré) est ensuite enregistré sur le téléphone et fonctionne sans réseau. Lors d'une mise à jour, seuls les fichiers modifiés sont retéléchargés.

`inflate.js` : [fflate](https://github.com/101arrowz/fflate) 0.8.2, licence MIT © 2023 Arjun Barrett (décompression de secours pour les anciens iPhone).

## Carnet d'entretien – Insignia OPC

Application séparée du catalogue (dossier `entretien/`, sans clé de licence) : une intro animée, un tableau où ajouter chaque entretien (date, type d'opération, prix, kilométrage, note) avec le total, un onglet Essence (pleins, consommation moyenne aux 100 km, coût aux 100 km, budget moyen par mois et par an) et le budget prévisionnel.

- Téléphone : ouvrir https://hdbray-opc.github.io/opc-catalogue/entretien/ puis l'ajouter à l'écran d'accueil (même méthode que ci-dessus). Fonctionne hors ligne.
- Windows : télécharger `Carnet-entretien-OPC-x.y.z.exe` dans les *Releases* du dépôt (construit par `.github/workflows/entretien-exe.yml` depuis le dossier `desktop/`).

Les entretiens restent sur l'appareil ; les boutons *Sauvegarder* / *Restaurer* permettent de passer du téléphone à l'ordinateur.

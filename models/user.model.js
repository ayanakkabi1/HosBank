export class User {
    constructor({ id, nom, prenom, email, password, statut, role, created_at }) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.password = password;
        this.statut = statut;
        this.role = role;     
        this.created_at = created_at;
    }
}
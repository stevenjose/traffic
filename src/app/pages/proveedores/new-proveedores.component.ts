import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Proveedor } from '../../models/proveedor.model';
import Swal from 'sweetalert2';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-proveedores',
  templateUrl: './new-proveedores.component.html',
  styleUrls: ['./new-proveedores.component.css']
})
export class NewProveedoresComponent implements OnInit {
  public forma: FormGroup;
  public document_id;
  public proveedorBD: any;
  constructor(public db: AngularFirestore,
              public router: Router,
              public activatedRoute: ActivatedRoute) {

    activatedRoute.params.subscribe( params => {
      let id = params['id'];
      if ( id ) {
          console.log(' id ' + id);
          this.cargarProveedor( id );
      }
    });


   }

   cargarProveedor( id ){
    console.log('id ' + id);
    this.document_id = id;
    this.proveedorBD = this.getProveedor(id).subscribe( (resp: any) => {
      console.log('Cargando Valores' + resp.payload.data().nombre);
      this.forma.setValue({
          id,
          direccion: resp.payload.data().direccion,
          nombre:    resp.payload.data().nombre,
          tlf:       resp.payload.data().tlf
        });
    });
  }
  public getProveedor(documentId: string) {
    return this.db.collection('proveedores').doc(documentId).snapshotChanges();
  }
  ngOnInit() {
    this.forma = new FormGroup({
      id: new FormControl(null),
      direccion: new FormControl(null, Validators.required),
      nombre: new FormControl(null, Validators.required ),
      tlf: new FormControl(null, Validators.required)
    });
  }

  registarProveedor() {
    if ( this.forma.invalid) {
      return;
    }

    let proveedor = new Proveedor(
      this.forma.value.direccion,
      this.forma.value.nombre,
      this.forma.value.tlf
    );

    if ( this.forma.value.id ) {
      console.log(this.forma.value.id + 'Id');
      this.updateTienda(proveedor , this.forma.value.id).then(
        resp => {
          Swal.fire({
            type: 'success',
            title: 'Se realiza el Update satisfactoriamente',
            showConfirmButton: false,
            timer: 1500
          });
          this.router.navigate(['/proveedores']);
        }
      );

    }else{
      if (this.createProveedor( proveedor )){
        this.router.navigate(['/proveedores']);
      }
    }
  }

  updateTienda(value: Proveedor, id){
    //console.log('cod_prod ' + id );
    return this.db.collection('proveedores').doc(id).set({
      direccion: value.direccion,
      nombre: value.nombre,
      tlf: value.tlf
    });
  }

  createProveedor(value: Proveedor) {
    return this.db.collection('proveedores').add({
      direccion: value.direccion,
      nombre: value.nombre,
      tlf: value.tlf
    }).then( (resp) => {
      Swal.fire({
        type: 'success',
        title: 'Se registro satisfactoriamente',
        showConfirmButton: false,
        timer: 1500
      });
      console.error('Se crea el registro correctamente '+ resp);
    })
    .catch( (err) => {
      Swal.fire({
        type: 'warning',
        title: 'Ocurrio un error al guardar',
        showConfirmButton: false,
        timer: 1500
      });
      console.error('Error al actualizar ' + err);
    });
  }


}

<template>
  <div class="proveedores">
    <Toolbar class="mb-4">
      <template #start>
        <h2 class="m-0">Proveedores</h2>
      </template>
      <template #end>
        <Button label="Nuevo proveedor" icon="pi pi-plus" @click="openDialog" />
      </template>
    </Toolbar>

    <DataTable :value="proveedores" :loading="loading" responsiveLayout="scroll">
      <Column field="nombre" header="Nombre" sortable></Column>
      <Column field="telefono" header="Teléfono"></Column>
      <Column field="email" header="Email"></Column>
      <Column field="direccion" header="Dirección"></Column>
      <Column field="created_at" header="Fecha creación">
        <template #body="slotProps">
          {{ new Date(slotProps.data.created_at).toLocaleDateString() }}
        </template>
      </Column>
      <Column :exportable="false" header="Acciones">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProveedor(slotProps.data)" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDelete(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialogVisible" :header="dialogTitle" :modal="true" class="p-fluid" :style="{ width: '450px' }">
      <form @submit.prevent="saveProveedor">
        <div class="field">
          <label for="nombre">Nombre *</label>
          <InputText id="nombre" v-model="form.nombre" required autofocus />
        </div>
        <div class="field">
          <label for="telefono">Teléfono</label>
          <InputText id="telefono" v-model="form.telefono" />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <InputText id="email" v-model="form.email" type="email" />
        </div>
        <div class="field">
          <label for="direccion">Dirección</label>
          <Textarea id="direccion" v-model="form.direccion" rows="3" />
        </div>
        <div class="flex justify-content-end gap-2">
          <Button type="button" label="Cancelar" icon="pi pi-times" @click="dialogVisible = false" class="p-button-text" />
          <Button type="submit" label="Guardar" icon="pi pi-check" :loading="saving" />
        </div>
      </form>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../services/proveedores'
import Toolbar from 'primevue/toolbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const proveedores = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editing = ref(false)
const form = ref({})

const confirm = useConfirm()
const toast = useToast()

const dialogTitle = computed(() => editing.value ? 'Editar proveedor' : 'Nuevo proveedor')

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await getProveedores()
    proveedores.value = data
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proveedores', life: 3000 })
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editing.value = false
  form.value = { nombre: '', telefono: '', email: '', direccion: '' }
  dialogVisible.value = true
}

const editProveedor = (proveedor) => {
  editing.value = true
  form.value = { ...proveedor }
  dialogVisible.value = true
}

const saveProveedor = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await updateProveedor(form.value.id, form.value)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor actualizado', life: 3000 })
    } else {
      await createProveedor(form.value)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor creado', life: 3000 })
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (proveedor) => {
  confirm.require({
    message: `¿Estás seguro de eliminar ${proveedor.nombre}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await deleteProveedor(proveedor.id)
        toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Proveedor eliminado', life: 3000 })
        loadData()
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar', life: 3000 })
      }
    }
  })
}

onMounted(loadData)
</script>

<style scoped>
.proveedores {
  padding: 2rem;
}
.field {
  margin-bottom: 1.5rem;
}
</style>
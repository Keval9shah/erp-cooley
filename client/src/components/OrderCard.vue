<script setup lang="ts">
const props = defineProps<{
  order: any,
  machine: string,
  index: number,
  getRatio: (order: any) => number,
  formatDateCell: (params: { value: string }, appendStr?: string) => string
}>()

const emit = defineEmits<{
  (e: 'removeOrder', machine: string, index: number): void
}>()

function removeOrderLocal() {
  emit('removeOrder', props.machine, props.index)
}
</script>

<template>
  <div
    :key="order.fgMo + '-' + index"
    :class="order.moStatus === 'Closed' ? 'order-card bg-red' : 'order-card'"
    draggable="true"
  >
    <button class="remove-order-btn" @click.stop="removeOrderLocal" title="Remove order">✕</button>
    <div class="roll-size">
      {{ order.targetRollLen + "m" }}
    </div>

    <div class="order-id">
      {{ order.fgMo }} - {{ order.shipToCustomerName ? order.shipToCustomerName : order.fabItem }}
    </div>

    <template v-if="order.shipToCustomerName">
      <div class="order-item">
        <div :class="'item-span' + (getRatio(order) < 90 ? ' low-ratio' : '')">
          <span class="text-progress" :style="{ '--p': Math.min(100, getRatio(order)) + '%' }">
            {{ order.fabItem.slice(0, 5) }}
          </span>
        </div>
        {{ order.fabItem.slice(5) }}
        {{ order.fabMo === 'USE MASTER' ? '' : '(' + order.fabMo.replace(/^0+/, '') + ')' }}
        {{ ' | ' + order.coreSize }}
      </div>
    </template>
    <!-- {{getRatio(order)}} -->
    <div class="order-date">
      {{ formatDateCell({ value: order.soPromiseDate }, 'T00:00') }}
    </div>

    <div class="order-qty">
      {{ order.aGradeCompleted }} / {{ order.fgReqQty }} ({{ ((parseFloat(order.hrs) * parseFloat(order.openQty)) / parseFloat(order.fgReqQty)).toFixed(2) }} hrs)
    </div>
  </div>
</template>

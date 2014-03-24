/**
 * Marks a bean that is ordered relative to another bean
 */
interface Ordered  {

    /**
     * The bean's order. A higher value denotes a higher ordering value.
     */
    getOrder():number;
}

export = Ordered;
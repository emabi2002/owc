import { isPersistentDemonstrationConfigured, serverEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  checkTaxCompliance,
  processSandboxPayment,
  sendSandboxNotification,
  verifyBankAccount,
  verifyEmployer,
  verifyEmployment,
  verifyIdentity,
  verifyInsurancePolicy,
  verifyMedicalCertificate,
} from "../sandbox/agencies";
import { listIntegrationEvents } from "../sandbox/events";
import { listSandboxServiceStatuses } from "../sandbox/state";
import { PersistentIntegrationError, createPersistentIntegrationRepository } from "./repository";
import type {
  PersistentIntegrationRepository,
  PersistentNotificationInput,
  PersistentPaymentInput,
  PersistentRpcClient,
} from "./types";

const defaultFallback = {
  verifyIdentity,
  verifyEmployer,
  checkTaxCompliance,
  verifyEmployment,
  verifyMedicalCertificate,
  verifyInsurancePolicy,
  verifyBankAccount,
  processPayment: processSandboxPayment,
  sendNotification: sendSandboxNotification,
  listEvents: listIntegrationEvents,
  listServiceState: listSandboxServiceStatuses,
};

type IntegrationFallback = typeof defaultFallback;

export function createIntegrationGateway(options: {
  persistentMode: boolean;
  repository: PersistentIntegrationRepository | null;
  fallback?: Partial<IntegrationFallback>;
}) {
  const fallback = { ...defaultFallback, ...options.fallback };

  function persistentRepository(): PersistentIntegrationRepository {
    if (!options.repository) throw new PersistentIntegrationError();
    return options.repository;
  }

  return {
    verifyIdentity: async (nid: string) => options.persistentMode
      ? persistentRepository().lookup("nid", nid)
      : Promise.resolve(fallback.verifyIdentity(nid)),
    verifyEmployer: async (registrationNo: string) => options.persistentMode
      ? persistentRepository().lookup("ipa", registrationNo)
      : Promise.resolve(fallback.verifyEmployer(registrationNo)),
    checkTaxCompliance: async (tin: string) => options.persistentMode
      ? persistentRepository().lookup("irc", tin)
      : Promise.resolve(fallback.checkTaxCompliance(tin)),
    verifyEmployment: async (employeeNo: string) => options.persistentMode
      ? persistentRepository().lookup("employer", employeeNo)
      : Promise.resolve(fallback.verifyEmployment(employeeNo)),
    verifyMedicalCertificate: async (certificateNo: string) => options.persistentMode
      ? persistentRepository().lookup("medical", certificateNo)
      : Promise.resolve(fallback.verifyMedicalCertificate(certificateNo)),
    verifyInsurancePolicy: async (policyNo: string) => options.persistentMode
      ? persistentRepository().lookup("insurance", policyNo)
      : Promise.resolve(fallback.verifyInsurancePolicy(policyNo)),
    verifyBankAccount: async (accountReference: string) => options.persistentMode
      ? persistentRepository().lookup("bank", accountReference)
      : Promise.resolve(fallback.verifyBankAccount(accountReference)),
    processPayment: async (input: PersistentPaymentInput) => options.persistentMode
      ? persistentRepository().processPayment(input)
      : Promise.resolve(fallback.processPayment(input)),
    sendNotification: async (input: PersistentNotificationInput) => options.persistentMode
      ? persistentRepository().sendNotification(input)
      : Promise.resolve(fallback.sendNotification(input)),
    listEvents: async (limit = 100) => options.persistentMode
      ? persistentRepository().listEvents(limit)
      : Promise.resolve(fallback.listEvents()),
    listServiceState: async () => {
      if (!options.persistentMode) return fallback.listServiceState();
      const states = await persistentRepository().listServiceState();
      return states.map((state) => ({
        service: state.service,
        status: state.mode,
      }));
    },
  };
}

function buildDefaultRepository(): PersistentIntegrationRepository | null {
  if (!isPersistentDemonstrationConfigured) return null;
  const client = createAdminSupabaseClient();
  return client
    ? createPersistentIntegrationRepository(client as unknown as PersistentRpcClient)
    : null;
}

const gateway = createIntegrationGateway({
  persistentMode: serverEnv.persistentDemonstration,
  repository: buildDefaultRepository(),
});

export const verifyIdentityIntegration = gateway.verifyIdentity;
export const verifyEmployerIntegration = gateway.verifyEmployer;
export const checkTaxComplianceIntegration = gateway.checkTaxCompliance;
export const verifyEmploymentIntegration = gateway.verifyEmployment;
export const verifyMedicalCertificateIntegration = gateway.verifyMedicalCertificate;
export const verifyInsurancePolicyIntegration = gateway.verifyInsurancePolicy;
export const verifyBankAccountIntegration = gateway.verifyBankAccount;
export const processSandboxPaymentIntegration = gateway.processPayment;
export const sendSandboxNotificationIntegration = gateway.sendNotification;
export const listIntegrationEventsGateway = gateway.listEvents;
export const listIntegrationServiceStateGateway = gateway.listServiceState;

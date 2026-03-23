const _litActionCode = async () => {
  try {
    const auth = jsParams.authorization;
    const candidate = jsParams.candidate;

    if (!auth || !candidate) {
      return Lit.Actions.setResponse({
        response: JSON.stringify({
          authorized: false,
          reason: "Missing authorization or candidate input.",
        }),
      });
    }

    const sameMember =
      auth.member?.toLowerCase() === candidate.member?.toLowerCase();
    const sameDelegatedContract =
      auth.delegatedContract?.toLowerCase() ===
      candidate.delegatedContract?.toLowerCase();
    const sameSavingCirclesContract =
      auth.savingCirclesContract?.toLowerCase() ===
      candidate.savingCirclesContract?.toLowerCase();
    const sameChain = Number(auth.chainId) === Number(candidate.chainId);
    const samePolicyId = auth.litPolicyId === candidate.litPolicyId;
    const scopeAllowsCircle =
      auth.scope === "all_circles" ||
      (auth.scope === "circle" && auth.circleId === candidate.circleId);

    let authorized = Boolean(auth.active);
    let reason = "Authorized";

    if (!authorized) {
      reason = "Authorization is inactive.";
    } else if (!sameMember) {
      authorized = false;
      reason = "Authorization member does not match candidate.";
    } else if (!sameDelegatedContract) {
      authorized = false;
      reason = "Delegated contract does not match authorization.";
    } else if (!sameSavingCirclesContract) {
      authorized = false;
      reason = "SavingCircles contract does not match authorization.";
    } else if (!sameChain) {
      authorized = false;
      reason = "Chain does not match authorization.";
    } else if (!samePolicyId) {
      authorized = false;
      reason = "Lit policy id does not match authorization.";
    } else if (!scopeAllowsCircle) {
      authorized = false;
      reason = "Authorization scope does not permit this circle.";
    }

    return Lit.Actions.setResponse({
      response: JSON.stringify({
        authorized,
        reason,
        scope: auth.scope,
        circleId: candidate.circleId,
        member: candidate.member,
      }),
    });
  } catch (error) {
    return Lit.Actions.setResponse({
      response: JSON.stringify({
        authorized: false,
        reason: error instanceof Error ? error.message : String(error),
      }),
    });
  }
};

export const litAutopayPolicyActionCode = `(${_litActionCode.toString()})();`;
